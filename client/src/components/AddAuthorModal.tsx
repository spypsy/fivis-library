import { Input, Modal, message } from 'antd';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Author } from 'types';

type AddAuthorModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated: (author: Author) => void;
};

const AddAuthorModal = ({ open, onClose, onCreated }: AddAuthorModalProps) => {
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setName('');
    }
  }, [open]);

  const onSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      message.error('Name is required');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await axios.post<Author>('/api/authors', { name: trimmed });
      message.success('Author created');
      onCreated(data);
      onClose();
    } catch (err) {
      const detail =
        axios.isAxiosError(err) && typeof err.response?.data === 'string'
          ? err.response.data
          : 'Failed to create author';
      message.error(detail);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Add author"
      open={open}
      onCancel={onClose}
      onOk={onSubmit}
      confirmLoading={submitting}
      okText="Create"
      destroyOnClose
    >
      <Input
        placeholder="Author name"
        value={name}
        onChange={e => setName(e.target.value)}
        onPressEnter={onSubmit}
        autoFocus
      />
    </Modal>
  );
};

export default AddAuthorModal;
