import React from 'react';
import { Link } from 'react-router-dom';
import { Author } from 'types';
import { authorPagePath } from 'utils/authorPath';

type AuthorLinksProps = {
  authors?: Author[];
};

const AuthorLinks = ({ authors }: AuthorLinksProps) => {
  if (!authors?.length) {
    return null;
  }

  return (
    <>
      {authors.map((author, index) => (
        <React.Fragment key={author.id || author.name}>
          {index > 0 && ', '}
          <Link to={authorPagePath(author.name)}>{author.name}</Link>
        </React.Fragment>
      ))}
    </>
  );
};

export default AuthorLinks;
