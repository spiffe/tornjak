import React, { Component } from 'react';
import './style.css';
import { RootState } from 'redux/reducers';
import { connect } from 'react-redux';
import InlineLoading from 'carbon-components-react/lib/components/InlineLoading';
import { Dropdown } from 'carbon-components-react';
import TornjakApi from './tornjak-api-helpers';
import {
  spireHealthCheckFunc,
  spireHealthCheckingFunc,
  spireHealthCheckRefreshTimeFunc
} from 'redux/actions';
import { SpireHealtCheckFreq } from './types';

const spireHealthCheckTimeOptions =
  [
    '10 Seconds',
    '30 Seconds',
    '1 Minute',
    '2 Minutes',
    '5 Minutes',
    '10 Minutes',
    '30 Minutes',
    '1 Hour',
    '1 Day',
  ];

type SpireHealthCheckProp = {
  // dispatches a payload for the status of SPIRE health as a boolean has a return type of void
  spireHealthCheckFunc: (globalSpireHealthCheck: boolean) => void,
  // the status of SPIRE health
  globalSpireHealthCheck: boolean,
  // dispatches a payload for the loading state of SPIRE health as a boolean and has a return type of void
  spireHealthCheckingFunc: (globalSpireHealthCheck: boolean) => void,
  // the loading state of SPIRE health
  globalSpireHealthChecking: boolean,
  // the resfresh rate of spire health check
  spireHealthCheckRefreshTimeFunc: (globalSpireHealthTime: SpireHealtCheckFreq) => void,
  // dispatches a payload for the resfresh rate of spire health check as a number and has a return type of void
  globalSpireHealthTime: SpireHealtCheckFreq
}

type SpireHealthCheckState = {
  // timer to check SPIRE health
  timer: NodeJS.Timeout | Date | null,
}

class SpireHealthCheck extends Component<SpireHealthCheckProp, SpireHealthCheckState> {
  TornjakApi: TornjakApi;
  constructor(props: SpireHealthCheckProp) {
    super(props);
    this.TornjakApi = new TornjakApi(props);
    this.onChangeSpireRefreshRate = this.onChangeSpireRefreshRate.bind(this);
    this.state = {
      timer: null,
    };
  }

  componentDidMount() {
    this.startTimer();
    this.TornjakApi.spireHealthCheck(this.props.spireHealthCheckFunc, this.props.spireHealthCheckingFunc);
  }

  componentDidUpdate(prevProps: SpireHealthCheckProp, prevState: SpireHealthCheckState) {
    // trigger refresh rate update once user selects a different time
    if (prevProps.globalSpireHealthTime !== this.props.globalSpireHealthTime) {
      this.startTimer();
    }
    if (prevState.timer !== this.state.timer) {
      // timer ended, check status of SPIRE
      this.TornjakApi.spireHealthCheck(this.props.spireHealthCheckFunc, this.props.spireHealthCheckingFunc);
    }
  }

  startTimer = () => {
    console.log(this.props.globalSpireHealthTime.SpireHealtCheckTime)
    const timer = setTimeout(() => {
      this.setState({ timer: new Date() });
      this.startTimer(); // restart timer
    }, this.props.globalSpireHealthTime.SpireHealtCheckTime * 1000); // time to check SPIRE health in milliseconds
    this.setState({ timer });
  };

  convertDurationToSeconds(durationString: string) {
    const parts = durationString.split(' ');
    const numericValue = parseInt(parts[0], 10);
    let conversionFactor;
    switch (parts[1]) {
      case 'Minute':
      case 'Minutes':
        conversionFactor = 60;
        break;
      case 'Hours':
      case 'Hour':
        conversionFactor = 60 * 60;
        break;
      case 'Days':
      case 'Day':
        conversionFactor = 24 * 60 * 60;
        break;
      default:
        conversionFactor = 1;
    }
    return numericValue * conversionFactor;
  }

  onChangeSpireRefreshRate = (selected: { selectedItem: string }): void => {
    if (selected === undefined) {
      return;
    }
    var sid = selected.selectedItem;
    var seconds = this.convertDurationToSeconds(sid);
    var refreshRateFreq = {
      SpireHealtCheckTime: seconds,
      SpireHealtCheckFreqDisplay: sid
    }
    this.props.spireHealthCheckRefreshTimeFunc(refreshRateFreq)
  }

  render() {
    const success = this.props.globalSpireHealthCheck, checking = this.props.globalSpireHealthChecking;
    let spireStatus =
      <div>
        <InlineLoading
          status={success ? 'finished' : 'error'}
          description={success ? 'Active' : 'InActive'} />
      </div>
    return (
      <div>
        <div className="spire-health-check-refresh-dropdown">
          <Dropdown
            ariaLabel="spire-refresh-rate-drop-down"
            id="spire-refresh-rate-drop-down"
            items={spireHealthCheckTimeOptions}
            defaultValue={this.props.globalSpireHealthTime.SpireHealtCheckFreqDisplay}
            label={this.props.globalSpireHealthTime.SpireHealtCheckFreqDisplay}
            titleText="Refresh Rate"
            onChange={this.onChangeSpireRefreshRate}
          />
        </div>
        <div className="divider">
          <span ></span>
        </div>
        <div>
          <div className='health-status-check-title'>
            <h6>SPIRE Health Check : </h6>
          </div>
          <div className='health-status-check-icon'>
            {!checking &&
              <InlineLoading
                status="active"
                description="Checking Status..." />
            }
            {checking && spireStatus}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  globalSpireHealthCheck: state.servers.globalSpireHealthCheck,
  globalSpireHealthChecking: state.servers.globalSpireHealthChecking,
  globalSpireHealthTime: state.servers.globalSpireHealthTime,
})

export default connect(
  mapStateToProps,
  { spireHealthCheckFunc, spireHealthCheckingFunc, spireHealthCheckRefreshTimeFunc }
)(SpireHealthCheck)

export { SpireHealthCheck }