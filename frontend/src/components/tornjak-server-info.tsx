import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Accordion, AccordionItem, Tag, TagTypeName } from "carbon-components-react";
import IsManager from './is_manager';
import TornjakApi from './tornjak-api-helpers';
import {
  serverSelectedFunc,
  serverInfoUpdateFunc,
  tornjakServerInfoUpdateFunc,
  tornjakMessageFunc,
} from 'redux/actions';
import { RootState } from 'redux/reducers';

import {
  TornjakServerInfo as TornjakServInfo,
  DebugServerInfo,
} from './types';
import { InlineNotification } from 'carbon-components-react';

const pluginTagColorMapper: { [key: string]: TagTypeName | undefined; } = {
  "NodeAttestor": "red",
  "WorkloadAttestor": "green",
  "KeyManager": "cyan",
  "NodeResolver": "blue",
  "Notifier": "teal",
  "DataStore": "purple",
}

type TornjakServerInfoProp = {
  // dispatches a payload for the debug server info of the selected server and has a return type of void
  spireDebugServerInfoUpdateFunc: (globalDebugServerInfo: DebugServerInfo) => void,
  // tornjak server debug info of the selected server
  globalDebugServerInfo: DebugServerInfo,
  // dispatches a payload for the tornjak server info of the selected server and has a return type of void
  tornjakServerInfoUpdateFunc: (globalTornjakServerInfo: TornjakServInfo) => void,
  // dispatches a payload for an Error Message/ Success Message of an executed function as a string and has a return type of void
  tornjakMessageFunc: (globalErrorMessage: string) => void,
  // the selected server for manager mode 
  globalServerSelected: string,
  // tornjak server info of the selected server
  globalTornjakServerInfo: TornjakServInfo,
  // error/ success messege returned for a specific function
  globalErrorMessage: string,
}

type TornjakServerInfoState = {}

const PluginTags = (props: { names: string[], type: string }) => (
  <>
    {props.names.map((value: string) =>
      <Tag key={value} type={pluginTagColorMapper[props.type]}>{props.type + ": " + value}</Tag>
    )}
  </>
)
const TornjakServerInfoDisplay = (props: { tornjakServerInfo: TornjakServInfo, tornjakDebugInfo: DebugServerInfo }) => (
  <Accordion>
    <AccordionItem title="Trust Domain" open>
      <p>
        {props.tornjakDebugInfo.svid_chain[0].id.trust_domain}
      </p>
    </AccordionItem>
    <AccordionItem title="Plugins" open>
      {(props.tornjakServerInfo.trustDomain !== "" && props.tornjakServerInfo.verboseConfig !== "")
        ? (
          <table>
            <tbody>
              {
                (props.tornjakServerInfo.plugins &&
                  Object.entries(props.tornjakServerInfo.plugins).map(([key, value]) =>
                    <tr key={key + ":" + value}>
                      <td>
                        <PluginTags type={key} names={value} />
                      </td>
                    </tr>)
                )
              }
            </tbody>
          </table>
        )
        :
        (
          <div>
            <InlineNotification
              kind="warning"
              hideCloseButton
              lowContrast
              title="Note: No Plugin Info Provided from server. Tornjak Backend does not have access to SPIRE config!"
            />
          </div>
        )
      }
    </AccordionItem>
    <AccordionItem title="Verbose Config (click to expand)">
      {(props.tornjakServerInfo.trustDomain !== "" && props.tornjakServerInfo.verboseConfig !== "")
        ? (
          <pre>
            {props.tornjakServerInfo.verboseConfig}
          </pre>
        )
        : (
          <div>
            <InlineNotification
              kind="warning"
              hideCloseButton
              lowContrast
              title="Note: No Server Config Provided from server. Tornjak Backend does not have access to SPIRE config!"
            />
          </div>
        )
      }
    </AccordionItem>
  </Accordion>
)

class TornjakServerInfo extends Component<TornjakServerInfoProp, TornjakServerInfoState> {
  TornjakApi: TornjakApi;
  constructor(props: TornjakServerInfoProp) {
    super(props);
    this.TornjakApi = new TornjakApi(props);
    this.state = {};
  }

  componentDidMount() {
    if (IsManager) {
      if (this.props.globalServerSelected !== "") {
        this.TornjakApi.populateTornjakServerInfo(this.props.globalServerSelected, this.props.tornjakServerInfoUpdateFunc, this.props.tornjakMessageFunc);
      }
    } else {
      this.TornjakApi.populateLocalTornjakServerInfo(this.props.tornjakServerInfoUpdateFunc, this.props.tornjakMessageFunc);
      this.TornjakApi.populateLocalTornjakDebugServerInfo(this.props.spireDebugServerInfoUpdateFunc, this.props.tornjakMessageFunc);
    }
  }

  componentDidUpdate(prevProps: TornjakServerInfoProp) {
    if (IsManager) {
      if (prevProps.globalServerSelected !== this.props.globalServerSelected) {
        this.TornjakApi.populateTornjakServerInfo(this.props.globalServerSelected, this.props.tornjakServerInfoUpdateFunc, this.props.tornjakMessageFunc)
      }
    }
  }

  tornjakServerInfo() {
    if (!this.props.globalDebugServerInfo || Object.keys(this.props.globalDebugServerInfo).length === 0) {
      return ""
    } else {
      return <TornjakServerInfoDisplay
        tornjakServerInfo={this.props.globalTornjakServerInfo}
        tornjakDebugInfo={this.props.globalDebugServerInfo} />
    }
  }

  render() {
    return (
      <div>
        <h3>Server Info</h3>
        {this.props.globalErrorMessage !== "OK" && this.props.globalErrorMessage !== "No Content" &&
          <div className="alert-primary" role="alert">
            <pre>
              {this.props.globalErrorMessage}
            </pre>
          </div>
        }
        <br /><br />
        {this.tornjakServerInfo()}
      </div>
    )
  }
}

const mapStateToProps = (state: RootState) => ({
  globalServerSelected: state.servers.globalServerSelected,
  globalServerInfo: state.servers.globalServerInfo,
  globalTornjakServerInfo: state.servers.globalTornjakServerInfo,
  globalErrorMessage: state.tornjak.globalErrorMessage,
  globalDebugServerInfo: state.servers.globalDebugServerInfo,
})

export default connect(
  mapStateToProps,
  { serverSelectedFunc, tornjakServerInfoUpdateFunc, serverInfoUpdateFunc, tornjakMessageFunc }
)(TornjakServerInfo)