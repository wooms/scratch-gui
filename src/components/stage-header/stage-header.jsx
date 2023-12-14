import {defineMessages, injectIntl, intlShape} from 'react-intl';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import VM from 'scratch-vm';

import Box from '../box/box.jsx';
import Button from '../button/button.jsx';
import ToggleButtons from '../toggle-buttons/toggle-buttons.jsx';
import Controls from '../../containers/controls.jsx';
import {getStageDimensions} from '../../lib/screen-utils';
import {STAGE_SIZE_MODES} from '../../lib/layout-constants';

import fullScreenIcon from './icon--fullscreen.svg';
import largeStageIcon from './icon--large-stage.svg';
import smallStageIcon from './icon--small-stage.svg';
import unFullScreenIcon from './icon--unfullscreen.svg';
import saveIcon from './icon--save.svg';
import checkboxCircleLineIcon from './icon--checkbox-circle-line.svg';

import scratchLogo from '../menu-bar/scratch-logo.svg';
import styles from './stage-header.css';
import {getIsAutoUpdating, getIsManualUpdating, manualUpdateProject} from '../../reducers/project-state.js';

const messages = defineMessages({
    largeStageSizeMessage: {
        defaultMessage: 'Switch to large stage',
        description: 'Button to change stage size to large',
        id: 'gui.stageHeader.stageSizeLarge'
    },
    smallStageSizeMessage: {
        defaultMessage: 'Switch to small stage',
        description: 'Button to change stage size to small',
        id: 'gui.stageHeader.stageSizeSmall'
    },
    fullStageSizeMessage: {
        defaultMessage: 'Enter full screen mode',
        description: 'Button to change stage size to full screen',
        id: 'gui.stageHeader.stageSizeFull'
    },
    unFullStageSizeMessage: {
        defaultMessage: 'Exit full screen mode',
        description: 'Button to get out of full screen mode',
        id: 'gui.stageHeader.stageSizeUnFull'
    },
    fullscreenControl: {
        defaultMessage: 'Full Screen Control',
        description: 'Button to enter/exit full screen mode',
        id: 'gui.stageHeader.fullscreenControl'
    }
});

const StageHeaderComponent = function (props) {
    const {
        isFullScreen,
        isPlayerOnly,
        isAutoUpdating,
        isManualUpdating,
        isSaveSuccessAlertVisible,
        onKeyPress,
        onSetStageLarge,
        onSetStageSmall,
        onSetStageFull,
        onSetStageUnFull,
        showBranding,
        stageSizeMode,
        onClickSave,
        vm
    } = props;

    let header = null;

    if (isFullScreen) {
        const stageDimensions = getStageDimensions(null, true);
        const stageButton = showBranding ? (
            <div className={styles.embedScratchLogo}>
                <a
                    href="https://scratch.mit.edu"
                    rel="noopener noreferrer"
                    target="_blank"
                >
                    <img
                        alt="Scratch"
                        src={scratchLogo}
                    />
                </a>
            </div>
        ) : (
            <div className={styles.unselectWrapper}>
                <Button
                    className={styles.stageButton}
                    onClick={onSetStageUnFull}
                    onKeyPress={onKeyPress}
                >
                    <img
                        alt={props.intl.formatMessage(messages.unFullStageSizeMessage)}
                        className={styles.stageButtonIcon}
                        draggable={false}
                        src={unFullScreenIcon}
                        title={props.intl.formatMessage(messages.fullscreenControl)}
                    />
                </Button>
            </div>
        );
        header = (
            <Box className={styles.stageHeaderWrapperOverlay}>
                <Box
                    className={styles.stageMenuWrapper}
                    style={{width: stageDimensions.width}}
                >
                    <Controls vm={vm} />
                    {stageButton}
                </Box>
            </Box>
        );
    } else {
        const stageControls =
            isPlayerOnly ? (
                []
            ) : (
                <div className={styles.stageSizeToggleGroup}>
                    <ToggleButtons
                        buttons={[
                            {
                                handleClick: onSetStageSmall,
                                icon: smallStageIcon,
                                iconClassName: styles.stageButtonIcon,
                                isSelected: stageSizeMode === STAGE_SIZE_MODES.small,
                                title: props.intl.formatMessage(messages.smallStageSizeMessage)
                            },
                            {
                                handleClick: onSetStageLarge,
                                icon: largeStageIcon,
                                iconClassName: styles.stageButtonIcon,
                                isSelected: stageSizeMode === STAGE_SIZE_MODES.large,
                                title: props.intl.formatMessage(messages.largeStageSizeMessage)
                            }
                        ]}
                    />
                </div>
            );
        header = (
            <Box className={styles.stageHeaderWrapper}>
                <Box className={styles.stageMenuWrapper}>
                    <Controls vm={vm} />
                    <div className={styles.stageSizeRow}>
                        {isSaveSuccessAlertVisible &&
                            <>
                                <img
                                    src={checkboxCircleLineIcon}
                                    className={styles.stageSaveIcon}
                                />
                                <div className={styles.stageSaveText}>
                                    {'저장함'}
                                </div>
                            </>}
                        {isAutoUpdating && <div className={styles.stageSaveText}>{'자동 저장 중..'}</div>}
                        {isManualUpdating && <div className={styles.stageSaveText}>{'저장 중..'}</div>}
                        <Button
                            className={styles.stageButton}
                            onClick={onClickSave}
                        >
                            <img
                                alt={'저장하기'}
                                className={styles.stageButtonIcon}
                                draggable={false}
                                src={saveIcon}
                                title={'저장하기'}
                            />
                        </Button>
                        <div className={styles.stageDivider} />
                        {stageControls}
                        <div>
                            <Button
                                className={styles.stageButton}
                                onClick={onSetStageFull}
                            >
                                <img
                                    alt={props.intl.formatMessage(messages.fullStageSizeMessage)}
                                    className={styles.stageButtonIcon}
                                    draggable={false}
                                    src={fullScreenIcon}
                                    title={props.intl.formatMessage(messages.fullscreenControl)}
                                />
                            </Button>
                        </div>
                    </div>
                </Box>
            </Box>
        );
    }

    return header;
};

const mapStateToProps = state => {
    const loadingState = state.scratchGui.projectState.loadingState;
    const alertState = state.scratchGui.alerts;
    return {
        // This is the button's mode, as opposed to the actual current state
        stageSizeMode: state.scratchGui.stageSize.stageSize,
        isAutoUpdating: getIsAutoUpdating(loadingState),
        isManualUpdating: getIsManualUpdating(loadingState),
        // 저장 완료 상태는 따로 정의되어 있지 않습니다. 단, Alert의 형태로 저장 완료 메시지가 노출됩니다.
        // 이 Alert의 상태를 확인하여 저장완료 텍스트를 노출합니다.
        isSaveSuccessAlertVisible: (alertState.visible &&
            alertState.alertsList.some(alert => alert.alertId === 'saveSuccess'))
    };
};

const mapDispatchToProps = dispatch => ({
    onClickSave: () => dispatch(manualUpdateProject())
});

StageHeaderComponent.propTypes = {
    intl: intlShape,
    isFullScreen: PropTypes.bool.isRequired,
    isPlayerOnly: PropTypes.bool.isRequired,
    onKeyPress: PropTypes.func.isRequired,
    onSetStageFull: PropTypes.func.isRequired,
    onSetStageLarge: PropTypes.func.isRequired,
    onSetStageSmall: PropTypes.func.isRequired,
    onSetStageUnFull: PropTypes.func.isRequired,
    showBranding: PropTypes.bool.isRequired,
    stageSizeMode: PropTypes.oneOf(Object.keys(STAGE_SIZE_MODES)),
    vm: PropTypes.instanceOf(VM).isRequired
};

StageHeaderComponent.defaultProps = {
    stageSizeMode: STAGE_SIZE_MODES.large
};

export default injectIntl(connect(
    mapStateToProps,
    mapDispatchToProps
)(StageHeaderComponent));
