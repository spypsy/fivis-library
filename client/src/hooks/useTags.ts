import useAxios from 'axios-hooks';
import { Tag as TagType } from 'types';

export const useTags = () => {
  const [{ data: tagsData, loading, error }, refetch] = useAxios<TagType[]>('/api/tags', { useCache: false });

  return {
    tags: tagsData || [],
    loading,
    error,
    refetch,
  };
};
