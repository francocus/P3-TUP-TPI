import { Button, Modal } from 'react-bootstrap';

const DeleteCaseModal = ({ show, legalCase, onHide, onDeleteCase }) => {
  const handleDelete = () => {
    onDeleteCase?.(legalCase.id);
    onHide?.();
  };

  return (
    <Modal
      show={show}
      centered
      backdrop="static"
      onHide={onHide}
      dialogClassName="cases-delete-modal__dialog"
      contentClassName="cases-delete-modal__content"
    >
      <Modal.Header className="cases-delete-modal__header" closeButton closeVariant="white">
        <Modal.Title className="cases-delete-modal__title">Eliminar expediente</Modal.Title>
      </Modal.Header>

      <Modal.Body className="cases-delete-modal__body">
        Estas seguro que deseas eliminar el expediente <b>{legalCase?.caseNumber}</b>?
      </Modal.Body>

      <Modal.Footer className="cases-delete-modal__footer">
        <Button
          variant="secondary"
          className="cases-form__button cases-form__button--secondary"
          onClick={onHide}
        >
          Cancelar
        </Button>
        <Button
          variant="danger"
          className="cases-form__button cases-delete-modal__danger"
          onClick={handleDelete}
        >
          Si, deseo eliminarlo
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteCaseModal;
