import { NextFunction, Response } from 'express';

import { DbSingleton } from '../db';
import { UserAuthRequest } from './jwt';

export interface LibraryContextRequest extends UserAuthRequest {
  libraryUserId: string;
}

export async function libraryContext(req: LibraryContextRequest, res: Response, next: NextFunction) {
  const header = req.headers['x-library-owner'];
  const ownerId = typeof header === 'string' ? header.trim() : '';

  if (!ownerId || ownerId === req.user.id) {
    req.libraryUserId = req.user.id;
    return next();
  }

  try {
    const db = await DbSingleton.get();
    const allowed = await db.canViewLibrary(req.user.id, ownerId);
    if (!allowed) {
      return res.status(403).send('Not allowed to view this library');
    }
    req.libraryUserId = ownerId;
    return next();
  } catch (error) {
    console.error('Library context resolution failed', error);
    return res.sendStatus(500);
  }
}

// Shared libraries are read-only: writes are refused while viewing someone else's library.
export function requireOwnLibrary(req: LibraryContextRequest, res: Response, next: NextFunction) {
  if (req.libraryUserId !== req.user.id) {
    return res.status(403).send('Shared libraries are read-only');
  }
  return next();
}
