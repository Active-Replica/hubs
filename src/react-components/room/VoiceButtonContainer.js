import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { ReactComponent as MicrophoneIcon } from "../icons/Microphone.svg";
import { ReactComponent as MicrophoneMutedIcon } from "../icons/MicrophoneMuted.svg";
import { ToolbarButton } from "../input/ToolbarButton";
import { useMicrophone } from "./useMicrophone";
import { FormattedMessage } from "react-intl";
import { InfoReason, InfoRoomModal } from "./InfoRoomModal";

export function VoiceButtonContainer({ scene, microphoneEnabled, showNonHistoriedDialog, canAudio}) {
  const buttonRef = useRef();

  const { isMuted, volume, toggleMute } = useMicrophone(scene);

  useEffect(
    () => {
      const rect = buttonRef.current.querySelector("rect");

      if (volume < 0.05) {
        rect.setAttribute("height", 0);
      } else if (volume < 0.3) {
        rect.setAttribute("y", 8);
        rect.setAttribute("height", 4);
      } else {
        rect.setAttribute("y", 4);
        rect.setAttribute("height", 8);
      }
    },
    [volume, isMuted]
  );

  return (
    <ToolbarButton
      ref={buttonRef}
      icon={isMuted || !microphoneEnabled ? <MicrophoneMutedIcon /> : <MicrophoneIcon />}
      label={<FormattedMessage id="voice-button-container.label" defaultMessage="Voice" />}
      preset="basic"
      onClick={ () => {
        if(canAudio) {
          toggleMute();
        } else {
          showNonHistoriedDialog(InfoRoomModal, {
            destinationUrl: "/",
            reason: InfoReason.audioBlocked
          })
        }
      }}
      statusColor={isMuted || !microphoneEnabled ? "disabled" : "enabled"}
    />
  );
}

VoiceButtonContainer.propTypes = {
  scene: PropTypes.object.isRequired,
  microphoneEnabled: PropTypes.bool,
  canAudio: PropTypes.bool,
  showNonHistoriedDialog: PropTypes.func.isRequired
};
