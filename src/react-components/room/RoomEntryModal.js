import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { Modal } from "../modal/Modal";
import { Button } from "../input/Button";
import { ReactComponent as EnterIcon } from "../icons/Enter.svg";
import { ReactComponent as VRIcon } from "../icons/VR_white.svg";
import { ReactComponent as ShowIcon } from "../icons/Show.svg";
import { ReactComponent as SettingsIcon } from "../icons/Settings.svg";
import { ReactComponent as HmcLogo } from "../icons/HmcLogo.svg";
import styles from "./RoomEntryModal.scss";
import styleUtils from "../styles/style-utils.scss";
import { useCssBreakpoints } from "react-use-css-breakpoints";
import { Column } from "../layout/Column";
import { FormattedMessage } from "react-intl";
import configs from "../../utils/configs";

export function RoomEntryModal({
  appName,
  logoSrc,
  className,
  roomName,
  showJoinRoom,
  onJoinRoom,
  showEnterOnDevice,
  onEnterOnDevice,
  showSpectate,
  onSpectate,
  showOptions,
  onOptions,
  ...rest
}) {
  const breakpoint = useCssBreakpoints();
  const isHmc = configs.feature("show_cloud");
  return (
    <Modal className={classNames(styles.roomEntryModal, className)} disableFullscreen {...rest}>
      <Column center className={styles.content}>
        {breakpoint !== "sm" &&
          breakpoint !== "md" && (
            <div className={styles.logoContainer}>
              {isHmc ? <HmcLogo className="hmc-logo" /> : <img src={logoSrc} alt={appName} />}
            </div>
          )}
        <Column center className={styles.buttons}>
          {showJoinRoom && (
            <Button preset="accent4" onClick={onJoinRoom}>
              <EnterIcon />
              <span>
                <FormattedMessage id="room-entry-modal.join-room-button" defaultMessage="Join Room" />
              </span>
            </Button>
          )}
          {showEnterOnDevice && (
            <Button preset="transparent" onClick={onEnterOnDevice}
						  style={{"color": "black", "backgroundColor": "transparent", "border": "none"}}>
              <VRIcon />
              <span>
                <FormattedMessage style={{"color":"black"}} id="room-entry-modal.enter-on-device-button" defaultMessage="Enter On Device" />
              </span>
            </Button>
          )}
          {showSpectate && (
            <Button preset="transparent" onClick={onSpectate}
						  style={{"color": "black", "backgroundColor": "transparent", "border": "none"}}>
              <ShowIcon />
              <span>
                <FormattedMessage style={{"color":"black"}} id="room-entry-modal.spectate-button" defaultMessage="Spectate" />
              </span>
            </Button>
          )}
          {showOptions &&
            breakpoint !== "sm" && (
              <>
                <hr className={styleUtils.showLg} />
                <Button preset="transparent" className={styleUtils.showLg} onClick={onOptions}>
                  <SettingsIcon />
                  <span>
                    <FormattedMessage id="room-entry-modal.options-button" defaultMessage="Options" />
                  </span>
                </Button>
              </>
            )}
        </Column>
      </Column>
    </Modal>
  );
}

RoomEntryModal.propTypes = {
  appName: PropTypes.string,
  logoSrc: PropTypes.string,
  className: PropTypes.string,
  roomName: PropTypes.string.isRequired,
  showJoinRoom: PropTypes.bool,
  onJoinRoom: PropTypes.func,
  showEnterOnDevice: PropTypes.bool,
  onEnterOnDevice: PropTypes.func,
  showSpectate: PropTypes.bool,
  onSpectate: PropTypes.func,
  showOptions: PropTypes.bool,
  onOptions: PropTypes.func
};

RoomEntryModal.defaultProps = {
  showJoinRoom: true,
  showEnterOnDevice: true,
  showSpectate: true,
  showOptions: true
};
