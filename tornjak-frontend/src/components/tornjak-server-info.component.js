import React, { Component } from 'react';
import { connect } from 'react-redux';
import IsManager from './is_manager';
import TornjakApi from './tornjak-api-helpers';
import {
  serverSelectedFunc,
  serverInfoUpdateFunc,
  tornjakServerInfoUpdateFunc,
  tornjakMessegeFunc,
} from 'actions';

const TornjakServerInfoDisplay = props => (
  <p>
    <pre>
      {props.tornjakServerInfo}
    </pre>
  </p>
)

class TornjakServerInfo extends Component {
  constructor(props) {
    super(props);
    this.TornjakApi = new TornjakApi();
    this.state = {};
  }

  componentDidMount() {
    if (IsManager) {
      if (this.props.globalServerSelected !== "") {
        this.TornjakApi.populateTornjakServerInfo(this.props.globalServerSelected, this.props.tornjakServerInfoUpdateFunc, this.props.tornjakMessegeFunc);
      }
    } else {
      this.TornjakApi.populateLocalTornjakServerInfo(this.props.tornjakServerInfoUpdateFunc, this.props.tornjakMessegeFunc);
    }
  }

  componentDidUpdate(prevProps) {
    if (IsManager) {
      if (prevProps.globalServerSelected !== this.props.globalServerSelected) {
        this.TornjakApi.populateTornjakServerInfo(this.props.globalServerSelected, this.props.tornjakServerInfoUpdateFunc, this.props.tornjakMessegeFunc)
      }
    } 
  }

  tornjakServerInfo() {
    if (this.props.globalTornjakServerInfo === "") {
      return ""
    } else {
      return <TornjakServerInfoDisplay tornjakServerInfo={this.props.globalTornjakServerInfo} />
    }
  }

  render() {
    return (
      <div>
        <h3>Server Info</h3>
        {this.props.globalErrorMessege !== "OK" &&
          <div className="alert-primary" role="alert">
            <pre>
              {this.props.globalErrorMessege}
            </pre>
          </div>
        }
        {IsManager}
        <br /><br />
        {this.tornjakServerInfo()}
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  globalServerSelected: state.servers.globalServerSelected,
  globalServerInfo: state.servers.globalServerInfo,
  globalTornjakServerInfo: state.servers.globalTornjakServerInfo,
  globalErrorMessege: state.tornjak.globalErrorMessege,
})

export default connect(
  mapStateToProps,
  { serverSelectedFunc, tornjakServerInfoUpdateFunc, serverInfoUpdateFunc, tornjakMessegeFunc }
)(TornjakServerInfo)