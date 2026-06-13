import { Button, Modal } from 'react-bootstrap';

const DeleteModal = ({ show, user, onHide, onDeleteUser }) => {
  const handleDelete = () => {
    onDeleteUser?.(user.id);
    onHide?.();
  };

  return (
    <Modal
      show={show}
      centered
      backdrop="static"
      onHide={onHide}
      dialogClassName="users-delete-modal__dialog"
      contentClassName="users-delete-modal__content"
    >
      <Modal.Header className="users-delete-modal__header" closeButton closeVariant="white">
        <Modal.Title className="users-delete-modal__title">Eliminar usuario</Modal.Title>
      </Modal.Header>

      <Modal.Body className="users-delete-modal__body">
        ¿Estás seguro que deseas eliminar al usuario <b>{user?.name}</b>?
      </Modal.Body>

      <Modal.Footer className="users-delete-modal__footer">
        <Button variant="secondary" className="users-form__button users-form__button--secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button variant="danger" className="users-form__button users-delete-modal__danger" onClick={handleDelete}>
          Sí, deseo eliminarlo
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteModal;
