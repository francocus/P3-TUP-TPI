import { Button, Modal } from 'react-bootstrap';

const DeleteModal = ({ show, onHide, onConfirm, title, message, itemName, confirmLabel }) => {
  const handleDelete = () => {
    onConfirm?.();
    onHide?.();
  };

  return (
    <Modal
      show={show}
      centered
      backdrop="static"
      onHide={onHide}
      dialogClassName="delete-modal__dialog"
      contentClassName="delete-modal__content"
    >
      <Modal.Header className="delete-modal__header" closeButton closeVariant="white">
        <Modal.Title className="delete-modal__title">{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body className="delete-modal__body">
        {message} <b>{itemName}</b>?
      </Modal.Body>

      <Modal.Footer className="delete-modal__footer">
        <Button
          variant="secondary"
          className="btn btn-secondary"
          onClick={onHide}
        >
          Cancelar
        </Button>
        <Button
          variant="danger"
          className="btn delete-modal__danger"
          onClick={handleDelete}
        >
          {confirmLabel}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteModal;