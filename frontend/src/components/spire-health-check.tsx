import { Component } from 'react';
import './style.css';
import { RootState } from 'redux/reducers';
import { connect } from 'react-redux';
import { Dropdown, InlineLoading } from 'carbon-components-react';
import TornjakApi from './tornjak-api-helpers';
import {
  spireHealthCheckFunc,
  spireHealthCheckingFunc,
  spireHealthCheckRefreshTimeFunc
} from 'redux/actions';
import { SpireHealthCheckFreq } from './types';

const spireHealthCheckTimeOptions =
  [
    '10 Secs',
    '30 Secs',
    '1 Min',
    '2 Mins',
    '5 Mins',
    '10 Mins',
    '30 Mins',
    '1 Hr',
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
  spireHealthCheckRefreshTimeFunc: (globalSpireHealthTime: SpireHealthCheckFreq) => void,
  // dispatches a payload for the resfresh rate of spire health check as a number and has a return type of void
  globalSpireHealthTime: SpireHealthCheckFreq
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
      case 'Min':
      case 'Mins':
        conversionFactor = 60;
        break;
      case 'Hrs':
      case 'Hr':
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
      SpireHealthCheckFreqDisplay: sid
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
      <div className="health-check">

          <div className="refresh_status">
            <div className="spire-health-check-refresh-dropdown">
              <Dropdown
                ariaLabel="spire-refresh-rate-drop-down"
                id="spire-refresh-rate-drop-down"
                items={spireHealthCheckTimeOptions}
                defaultValue={this.props.globalSpireHealthTime.SpireHealthCheckFreqDisplay}
                label={this.props.globalSpireHealthTime.SpireHealthCheckFreqDisplay}
                titleText="Refresh Rate"
                onChange={this.onChangeSpireRefreshRate}
              />
            </div>
            <div className='health-status-check-container'>
              <div className='health-status-check-title'>
                <h6>SPIRE: </h6>
              </div>
              <div className='health-status-check-icon'>
                {!checking &&
                  <InlineLoading
                    status="active"
                    description="Checking" />
                }
                {checking && spireStatus}
              </div>
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