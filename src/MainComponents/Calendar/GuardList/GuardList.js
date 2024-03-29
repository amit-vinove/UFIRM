import React, { Component } from "react";
import moment from "moment";
import LoadingOverlay from "react-loading-overlay";
import { PropagateLoader } from "react-spinners";
import Button from "../../../ReactComponents/Button/Button";
import DataTable from "../../../ReactComponents/ReactTable/DataTable";
import DropdownList from "../../../ReactComponents/SelectBox/DropdownList";
import MultiSelectDropdown from "../../KanbanBoard/MultiSelectDropdown";
import ApiProvider from "../DataProvider";
import * as appCommon from "../../../Common/AppCommon.js";
import swal from "sweetalert";

const $ = window.$;

export default class GuardList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [
        {
          Header: "Guard Id",
          accessor: "Id",
        },
        {
          Header: "Latitude",
          accessor: "Latitude",
        },
        {
          Header: "Longitude",
          accessor: "Longitude",
        },
        {
          Header: "MobileNo",
          accessor: "MobileNo",
        },
        {
          Header: "VisitDate",
          accessor: "VisitDate",
        },
      ],
      data: [],
      guardData: [],
      selectedGuardId: 0,
      loading: false,
      PageMode: "Home",
      guardId: "",
      filtered: false,
      filterFromDate:'',
      filterToDate:'',
      startDate :moment().clone().startOf("month"),
      endDate :moment().clone().startOf("month"),

    };
    this.ApiProvider = new ApiProvider();
  }


  getGuardSpotModel = (type, guardId,startDate) => {
    var model = [];
    switch (type) {
      case "R":
        model.push({
          CmdType: type,
          GuardId: guardId,
          VisitDate: startDate,
        });
        break;
      default:
    }
    return model;
  };

  getGuardDetailsModel = (type) => {
    var model = [];
    switch (type) {
      case "R":
        model.push({
          CmdType: type,
        });
        break;
      default:
    }
    return model;
  };

  manageGuardList = (model, type) => {
    this.ApiProvider.manageGuardData(model, type).then((resp) => {
      if (resp.ok && resp.status == 200) {
        return resp.json().then((rData) => {
          let guardData = [];
          rData.forEach((element) => {
            guardData.push({
              Id: element.Id,
              EmployeeName: element.EmployeeName,
              Designation: element.Designation,
              MobileNo: element.MobileNo,
            });
          });
          switch (type) {
            case "R":
              this.setState({ guardData: guardData });
              break;
            default:
          }
        });
      }
    });
  };

  manageGuardSpotList = (model, type) => {
    console.log(model);
    this.ApiProvider.manageGuardSpotVisitDetails(model, type).then((resp) => {
      if (resp.ok && resp.status == 200) {
        return resp.json().then((rData) => {
          switch (type) {
            case "R":
              let guardSpotData = [];
              rData.forEach((element) => {
                guardSpotData.push({
                  Id: element.Id,
                  Latitude: element.Latitude,
                  Longitude: element.Longitude,
                  MobileNo: element.MobileNo,
                  VisitDate: element.VisitDate,
                });
              });
              this.setState({ data: guardSpotData });
              break;
            default:
          }
        });
      }
    });
  };

  getGuardList() {
    var type = "R";
    var model = this.getGuardDetailsModel(type);
    this.manageGuardList(model, type);
  }


  getGuardSpotList() {
    var type = "R";
    var guardId = this.state.selectedGuardId
      ? this.state.selectedGuardId
      : 0;
    var startDate  = this.state.filterFromDate ? this.state.filterFromDate : this.state.startDate.format('YYYY-MM-DD');
    var model = this.getGuardSpotModel(type, guardId, startDate);
    this.manageGuardSpotList(model, type);
  }

  componentDidMount() {
    const startDate = this.state.startDate;
    const endDate = this.state.endDate;
    this.DateRangeConfig(startDate, endDate);
    this.getGuardList();
    // this.getGuardSpotList()
  }

  Filter = () => {
    if (this.state.selectedGuardId > 0) {
      this.setState({ filtered: true });
      this.getGuardSpotList();
    } else {
      appCommon.showtextalert("", "Please Select Any One of Guards !", "warning");
    }
  };

  Reset = () => {
    this.setState({
      filtered: false,
      selectedGuardId:0,
      //selectedSubCategoryId: 0,
      //occurance:'',
      //assignTo:0,
    });
    //this.getTasks();
  };

  DateRangeConfig(startDate, endDate) {
    let _this = this;
    $("#dataRange").daterangepicker({
      locale: {
        format: "DD/MM/YYYY",
      },
      startDate: startDate,
      endDate: endDate,
    });
    $('#dataRange').on('apply.daterangepicker', function (ev, picker) {
      var startDate = picker.startDate;
      var endDate = picker.endDate;
      console.log(startDate , endDate);
      _this.setState({ filterFromDate: startDate.format('YYYY-MM-DD'), filterToDate: endDate.format('YYYY-MM-DD') })
  });
  }

  render() {
    return (
      <div>
        {this.state.PageMode === "Home" && (
          <div className="row">
            <LoadingOverlay
              active={this.state.loading}
              spinner={<PropagateLoader color="#336B93" size={30} />}
            >
              <div className="col-12">
                <div className="card">
                  <div className="card-header d-flex p-0">
                    <ul className="nav tableFilterContainer">
                      <li className="nav-item">
                        <select
                          id="dllCategory"
                          className="form-control"
                          onChange={(e) =>
                            this.setState({
                              selectedGuardId: e.target.value,
                            })
                          }
                          disabled={this.state.filtered}
                          value={this.state.selectedGuardId}
                        >
                          <option value={0}>Select Guard</option>
                          {this.state.guardData
                            ? this.state.guardData.map((e, key) => {
                                return (
                                  <option key={key} value={e.Id}>
                                    {e.EmployeeName}
                                  </option>
                                );
                              })
                            : null}
                        </select>
                      </li>

                      <li className="nav-item">
                        <div className="input-group input-group-sm">
                          <div className="form-group">
                            <div className="input-group">
                              <div className="input-group-prepend">
                                <span className="input-group-text">
                                  <i className="far fa-calendar-alt"></i>
                                </span>
                              </div>
                              <input
                                type="text"
                                className="form-control float-right"
                                id="dataRange"
                          disabled={this.state.filtered}
                              ></input>
                            </div>
                          </div>
                        </div>
                      </li>
                    
        
                      {!this.state.filtered && (
                        <li>
                          <Button
                            id="btnNewTask"
                            Action={this.Filter.bind(this)}
                            ClassName="btn btn-primary"
                            Text="Filter"
                          />
                        </li>
                      )}
                      {this.state.filtered && (
                        <li>
                          <Button
                            id="btnNewTask"
                            Action={this.Reset.bind(this)}
                            ClassName="btn btn-danger"
                            Text="Reset"
                          />
                        </li>
                      )}
                    
                    </ul>
                    {/* <ul className="nav ml-auto tableFilterContainer">
                      <li className="nav-item">
                        <div className="input-group">
                          <div className="input-group-prepend">
                            <Button
                              id="btnNewTask"
                              // Action={this.AddNew.bind(this)}
                              ClassName="btn btn-success"
                              Icon={
                                <i
                                  className="fa fa-plus"
                                  aria-hidden="true"
                                ></i>
                              }
                              Text=" Create New"
                            />
                          </div>
                        </div>
                      </li>
                    </ul> */}
                  </div>
                  <div className="card-body pt-2">
                    <LoadingOverlay
                      active={this.state.loading}
                      spinner={<PropagateLoader color="#336B93" size={30} />}
                    >
                      <DataTable
                        data={this.state.data}
                        columns={this.state.columns}
                        hideGridSearchAndSize={true}
                        globalSearch={true}
                        isDefaultPagination={true}
                      />
                    </LoadingOverlay>
                  </div>
                </div>
              </div>
            </LoadingOverlay>
          </div>
        )}
      </div>
    );
  }
}
