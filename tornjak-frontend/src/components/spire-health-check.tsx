import React, { Component } from 'react';
import './style.css';
import { RootState } from 'redux/reducers';
import { connect } from 'react-redux';
import InlineLoading from 'carbon-components-react/lib/components/InlineLoading';

type SpireHealthCheckProp = {
}

type SpireHealthCheckState = {}

class SpireHealthCheck extends Component<SpireHealthCheckProp, SpireHealthCheckState> {
  constructor(props: SpireHealthCheckProp) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
  }

  render() {
    const success = false, checked = false;
    let spireStatus =
      <div>
        {success ? (
          <InlineLoading
            status='finished'
            description="Active" />
        ) : (
          <InlineLoading
            status='error'
            description="InActive" />
        )}
      </div>
    return (
      <div>
        <div className='health-status-check-title'>
          <h6>SPIRE Health Check : </h6>
        </div>
        <div className='health-status-check-icon'>
          {!checked &&
            <InlineLoading
              status="active"
              description="Checking Status..." />
          }
          {checked && spireStatus}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
})

export default connect(
  mapStateToProps,
  {}
)(SpireHealthCheck)

export { SpireHealthCheck }