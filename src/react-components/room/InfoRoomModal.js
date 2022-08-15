import React from "react";
import { useIntl, defineMessages, FormattedMessage } from "react-intl";
import PropTypes from "prop-types";
import { Modal } from "../modal/Modal";
import { CloseButton } from "../input/CloseButton";
import { Button } from "../input/Button";
import { Column } from "../layout/Column";

export const InfoReason = {
  audioBlocked: "audioBlocked"
};

const reasonMessages = defineMessages({
  [InfoReason.audioBlocked]: {
    id: "info-room-modal.audio-blocked.message",
    defaultMessage: "Audio has been disabled in this room."
  }
});

const confirmationMessages = defineMessages({
  [InfoReason.audioBlocked]: {
    id: "info-room-modal.audio-blocked.confirm",
    defaultMessage: "OK"
  }
});

export function InfoRoomModal({ reason, destinationUrl, onClose }) {
  const intl = useIntl();

  return (
    <Modal
      title={<FormattedMessage id="info-room-modal.title" defaultMessage="Info Room" />}
      beforeTitle={<CloseButton onClick={onClose} />}
    >
      <Column padding center centerMd="both" grow>
        <p>{intl.formatMessage(reasonMessages[reason])}</p>
        <Button as="a" preset="cancel" onClick={onClose} rel="noopener noreferrer">
          {intl.formatMessage(confirmationMessages[reason])}
        </Button>
      </Column>
    </Modal>
  );
}

InfoRoomModal.propTypes = {
  reason: PropTypes.string,
  destinationUrl: PropTypes.string,
  onClose: PropTypes.func
};
