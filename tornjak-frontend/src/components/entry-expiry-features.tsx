import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Dropdown, TextInput, NumberInput, InlineNotification } from 'carbon-components-react';
import TornjakApi from './tornjak-api-helpers';
import './style.css';
import SpiffeHelper from './spiffe-helper';
import {
  entryExpiryUpdateFunc
} from 'redux/actions';
import { RootState } from 'redux/reducers';
var moment = require('moment');
const JSMaxSafeTime = 8640000000000 // In seconds - JS cannot represent times safely larger than this

type EntryExpiryProp = {
  // dispatches a payload for the entry expiry time and has a return type of void
  entryExpiryUpdateFunc: (globalEntryExpiryTime: number) => void,
}

type EntryExpiryState = {
  expiresAt: number,
  expiryOption: string,
  expiryOptionList: String[],
  expiryDate: string,
  expiryTime: string,
  expiryUnsafe: boolean,
  expiryInvalid: boolean,
}

class EntryExpiryFeatures extends Component<EntryExpiryProp, EntryExpiryState> {
  TornjakApi: TornjakApi;
  SpiffeHelper: SpiffeHelper;
  constructor(props: EntryExpiryProp) {
    super(props);
    this.TornjakApi = new TornjakApi(props);
    this.SpiffeHelper = new SpiffeHelper(props);
    this.onChangeExpiryOption = this.onChangeExpiryOption.bind(this);
    this.expiryTimeUpdate = this.expiryTimeUpdate.bind(this);
    this.onChangeExpiresAtSeconds = this.onChangeExpiresAtSeconds.bind(this);
    this.isValidDate = this.isValidDate.bind(this);
    this.updateValidDateAndTime = this.updateValidDateAndTime.bind(this);
    this.onChangeExpiresAtTime = this.onChangeExpiresAtTime.bind(this);
    this.onChangeExpiresAtDate = this.onChangeExpiresAtDate.bind(this);
    this.state = {
      expiryOption: "None",
      expiryOptionList: ["None", "Seconds Since Epoch", "Date/Time"],
      expiryDate: "1/1/2021",
      expiryTime: "00:00",
      expiresAt: 0,
      expiryUnsafe: false,
      expiryInvalid: false,
    }
  }

  componentDidMount() {
  }

  componentDidUpdate(prevProps: EntryExpiryProp, prevState: EntryExpiryState) {
    this.props.entryExpiryUpdateFunc(this.state.expiresAt);
  }

  onChangeExpiryOption(e: { selectedItem: any; }) {
    this.setState({
      expiresAt: 0,
      expiryOption: e.selectedItem,
      expiryUnsafe: false,
      expiryInvalid: false
    });
  }

  isValidExpiryTime(seconds: number) {
    return seconds > 0 && seconds <= JSMaxSafeTime
  }

  expiryTimeUpdate(seconds: number) {
    this.setState({
      expiresAt: seconds,
      expiryUnsafe: !this.isValidExpiryTime(seconds)
    })
  }

  onChangeExpiresAtSeconds(e: any) {
    var seconds = Number(e.imaginaryTarget.value)
    this.expiryTimeUpdate(seconds)
  }

  isValidDate(d: Date) { // date is successfully translated in Javascript
    return d instanceof Date && !isNaN(d.getTime());
  }

  updateValidDateAndTime(d: string, t: string) {
    var mo = moment(d + ' ' + t, "MM/DD/YYYY hh:mm:ss", true)
    var testDate = mo._d; //extract date
    this.setState({ // should always reflect what the user sees
      expiryDate: d,
      expiryTime: t
    })
    if (this.isValidDate(testDate) && mo.isValid()) {
      this.setState({
        expiryInvalid: false,
      })
      var mstoSecConvFactor = 1000;
      var seconds = Math.floor(testDate.getTime() / mstoSecConvFactor)
      this.expiryTimeUpdate(seconds)
      console.log(d, t, this.state.expiryDate, this.state.expiryTime)
      return
    }
    this.setState({
      expiryInvalid: true,
    })
  }

  onChangeExpiresAtDate(e: { target: { value: string; }; }) {
    this.updateValidDateAndTime(e.target.value, this.state.expiryTime)
  }

  onChangeExpiresAtTime(e: { target: { value: string; }; }) {
    this.updateValidDateAndTime(this.state.expiryDate, e.target.value)
  }


  render() {
    return (
      <div>
        <div className="expiry-drop-down">
          <Dropdown
            //aria-required="true"
            //ariaLabel="expiry-drop-down"
            id="expiry-drop-down"
            items={this.state.expiryOptionList}
            label="None"
            defaultValue="None"
            titleText="Entry Expiry"
            helperText="Choose Entry Expiry Format"
            onChange={this.onChangeExpiryOption}
          />
        </div>
        {this.state.expiryOption !== "None" && <div className="expiryEntryFields">
          {this.state.expiryOption === "Seconds Since Epoch" &&
            <div className="expiryOption-field">
              <div className="expiryOption-entry">
                <NumberInput
                  aria-required="true"
                  helperText="(seconds since Unix epoch)"
                  id="expiresAt-input"
                  invalidText="Number is not valid"
                  label="Enter expiry time [*required]"
                  min={1}
                  step={1}
                  onChange={this.onChangeExpiresAtSeconds}
                  value={0} />
              </div>
            </div>
          }
          {this.state.expiryOption === "Date/Time" &&
            <div className="expiryOption-field">
              <div className="expiryOption-entry">
                <TextInput
                  labelText="Enter expiry date [*required]"
                  helperText="mm/dd/yyyy or mm/dd/yyyyy"
                  placeholder="08/13/2345"
                  //pattern={["^\\d{2}/\\d{2}/\\d{4,5}$"]}
                  onChange={this.onChangeExpiresAtDate}
                  id={''} 
                />
              </div>
              <div className="expiryOption-entry">
                <TextInput
                  labelText="Enter local time [*required]"
                  helperText="00:00:00 - 23:59:59 [hh:mm:ss]"
                  placeholder="hh:mm:ss"
                  //pattern={["^([0-1]\\d|2[0-3]):[0-5]\\d:[0-5]\\d$"]}
                  onChange={this.onChangeExpiresAtTime}
                  invalidText="NotGoodTime"
                  id={''} 
                />
              </div>
            </div>
          }
        </div>
        }
        {(this.state.expiryUnsafe || this.state.expiryInvalid) &&
          <div>
            <InlineNotification
              kind="warning-alt"
              hideCloseButton={true}
              title="Warning"
              subtitle={<span>Expiry time either in invalid format/ negative/ too large. Submitting this time may result in undefined behavior. </span>}
            >
            </InlineNotification>
            {this.state.expiryOption === "Seconds Since Epoch" && this.state.expiryUnsafe &&
              <InlineNotification
                kind="warning-alt"
                hideCloseButton={true}
                title="Warning"
                subtitle={<span>Seconds must be positive and less than MaxSafeTime="{JSMaxSafeTime} Seconds" </span>}
              >
              </InlineNotification>
            }
            {this.state.expiryOption === "Date/Time" && this.state.expiryUnsafe &&
              <InlineNotification
                kind="warning-alt"
                hideCloseButton={true}
                title="Warning"
                subtitle={<span>Date must be past January 1, 1970 @ 12:00AM GMT" </span>}
              >
              </InlineNotification>
            }
            {this.state.expiryOption === "Date/Time" && this.state.expiryInvalid &&
              <InlineNotification
                kind="warning-alt"
                hideCloseButton={true}
                title="Warning"
                subtitle={<span>Date or time format is invalid </span>}
              >
              </InlineNotification>
            }
          </div>
        }
      </div>
    )
  }
}


const mapStateToProps = (state: RootState) => ({
})

export default connect(
  mapStateToProps,
  { entryExpiryUpdateFunc }
)(EntryExpiryFeatures)

export { EntryExpiryFeatures };