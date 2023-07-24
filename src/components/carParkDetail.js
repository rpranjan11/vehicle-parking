import React, {useState} from 'react';
import Axios from 'axios';
import './style.css';
import {getDatabase, ref, push, child, update, get} from "firebase/database";
import {getCurrentDate, getCurrentTime} from './utils';
import * as XLSX from 'xlsx';
import FileSaver from 'file-saver';
import cors from 'cors';
// import { HttpProxyAgent } from 'http-proxy-agent';

function CarParkDetail() {

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [totalTicket, setTotalTicket] = useState("");
    const [carNumber, setCarNumber] = useState("");
    var parkingDate;
    var parkingTime;
    const [remarks, setRemarks] = useState("");
    const [checkDate, setCheckDate] = useState("");
    const [parkedCarNumber, setParkedCarNumber] = useState("");
    
    const handleInputChange = (e) => {
        const {id , value} = e.target;
        if(id === "name"){
            setName(value);
        }
        if(id === "phone"){
            setPhone(value);
        }
        if(id === "totalTicket"){
            setTotalTicket(value);
        }
        if(id === "carNumber"){
            setCarNumber(value);
        }
        if(id === "remarks"){
            setRemarks(value);
        }
        if(id === "checkDate"){
            setCheckDate(value);
        }
        if(id === "parkedCarNumber"){
            setParkedCarNumber(value);
        }
    }

    const handleCarPark  = () => {
        console.log(name, phone, totalTicket, carNumber, remarks); //
        const regex = /^[0-9]*[\u3131-\u314e|\u314f-\u3163|\uac00-\ud7a3]*[0-9]{4}$/g
        if (totalTicket < 1 || totalTicket > 2) {
            alert("총 주차 티켓 수는 2장 미만이어야 합니다!"); // The total number of parking tickets must be less than two
        }
        else if (!carNumber.match(regex)) {
            alert("차량 번호가 유효하지 않습니다!"); // The car's number is not valid
        }
        else {
            login();
            console.log(getCurrentDate()); //
            parkingDate = getCurrentDate();
            parkingTime = getCurrentTime();
            let obj = {
                FullName : name,
                PhoneNumber: phone,
                TotalTicket: totalTicket,
                UpdatedTicket : totalTicket,
                CarNumber: carNumber,
                ParkingDate: parkingDate,
                ParkingTime: parkingTime,
                PreviousTicketCheckinTime: '',
                Remarks: remarks,
            }
            console.log(obj); //
            const newPostKey = push(child(ref(getDatabase()), 'posts')).key;
            const updates = {};
            updates[carNumber] = obj
            return update(ref(getDatabase(), parkingDate), updates)
            .then((docRef) => {
                document.getElementById('name').value='';
                document.getElementById('phone').value='';
                document.getElementById('totalTicket').value='';
                document.getElementById('carNumber').value='';
                document.getElementById('remarks').value='';
                alert("차량 주차 성공!"); // Vehicle Successfully Parked
            })
            .catch((error) => {
                console.error("주차 오류 : ", error + "!!"); // Error in parking Car
            });
        }
    }

    function login () {
        Axios.post("https://tcp.parking.kakao.com/tenant/login", {"tenant":{"username":"newseoulphil","password":"123456789a!"}})
            .then((response)=>{

                console.log('Login Response : ', response); //
                if(response.status == 200) {
                    if(response.data.length != 0) {
                        console.log('Login Success!')
                        console.log('Login response header : ', response.headers)
                        console.log('Authorization Key : ', response.config.headers.Authorization)
                        console.log('Login Response data : ', response.data)
                    }else{
                        alert('로그인 오류!'); //Login Not Successful
                        process.exit();
                    }
                }else{
                    alert('Some Technical Error Occured!');
                    process.exit();
                }
        })
    }

    const getAuth = () => {
        const dbRef = ref(getDatabase());
        get(child(dbRef, `/${'Authentication'}`)).then((snapshot) => {
        if (snapshot.exists()) {
            console.log(snapshot.val()); //
            snapshot.forEach(childSnapshot=>{
                //
            });         
        } else {
            console.log("No data available");
        }
        }).catch((error) => {
        console.error(error);
        });
    }

    const updateAuth  = (authKey) => {
        console.log(authKey); //
        let obj = {
            AuthenticationType: 'Bearer',
            AuthenticationKey: authKey,
        }       
        const newPostKey = push(child(ref(getDatabase()), 'posts')).key;
        console.log(newPostKey); //
        const updates = {};
        updates[getCurrentDate()] = obj
        return update(ref(getDatabase(), 'Authentication'), updates)
        .then((docRef) => {
            console.log("Authentication Key Updated!");
        })
        .catch((error) => {
            console.error("Error in updating Authentication Key: ", error);
        });
    }

    var updateName;
    var updatePhone;
    var updateTotalTicket;
    var updateUpdatedTicket;
    var updateCarNumber;
    var updateParkingDate;

    const updateTicket = () => {
        const dbRef = ref(getDatabase());
        get(child(dbRef, `/${getCurrentDate()}`)).then((snapshot) => {
        if (snapshot.exists()) {
            // console.log(snapshot.val()); //
            snapshot.forEach(childSnapshot=>{
                if(childSnapshot.key == parkedCarNumber){
                    let data = childSnapshot.val();
                    updateName = data.FullName;
                    updatePhone = data.PhoneNumber;
                    updateTotalTicket = data.TotalTicket;
                    updateUpdatedTicket = data.UpdatedTicket - 1;
                    updateCarNumber = data.CarNumber;
                    updateParkingDate = data.ParkingDate;

                    //Start of Update Record in Db
                    let obj = {
                        FullName : updateName,
                        PhoneNumber: updatePhone,
                        TotalTicket: updateTotalTicket,
                        UpdatedTicket : updateUpdatedTicket,
                        CarNumber: updateCarNumber,
                        ParkingDate: updateParkingDate,
                        PreviousTicketCheckinTime: getCurrentTime(),
                    }
                    console.log('Updating Obj : ', obj); //
                    const updates = {};
                    updates[parkedCarNumber] = obj;
                    return update(ref(getDatabase(), getCurrentDate()), updates)
                    .then((docRef) => {
                        alert("Ticket Successfully Updated!");
                    })
                    .catch((error) => {
                        console.error("Error in Updating Ticket: ", error);
                    });
                    //End of Update Record in Db
                }                
            });         
        } else {
            console.log("No data available");
        }
        }).catch((error) => {
        console.error(error);
        });
    }

    function handleParkingPayment () {

        var verifyAvailableTicket = false;
        var searchCarResponse;
        var updateParkingLotResponse;
        var discountHistoryResponse;
        var discountResponse;

        //Start of checking available Parking ticket
        const dbRef = ref(getDatabase());
        get(child(dbRef, `/${getCurrentDate()}`)).then((snapshot) => {
            if (snapshot.exists()) {
                // console.log(snapshot.val()); //
                snapshot.forEach(childSnapshot=>{
                    if(childSnapshot.key == parkedCarNumber){
                        let data = childSnapshot.val();
                        if(data.UpdatedTicket > 0 && data.UpdatedTicket < 3) {
                            verifyAvailableTicket = true;
                        } 
                    }                
                });         
            }
            console.log('verifyAvailableTicket : ', verifyAvailableTicket); //

            /* ====== Start of Http Calls if Parking Ticket value is > 0 ====== */
            if(verifyAvailableTicket){

                var plateNumber = parkedCarNumber.substring(parkedCarNumber.length-4, parkedCarNumber.length);
                var searchCarUrl = 'https://tcp.parking.kakao.com/api/tenants/v1/in_out_logs?plate_number=' + plateNumber;
                var carId;
                var updateParkingLotUrl = 'https://tcp.parking.kakao.com/api/tenants/v1/user/update_current_parking_lot';
                const updateParkingLotData = { current_parking_lot_id: 54 };
                var authToken = 'eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiIzMDY3YTEzMS05NTA0LTQ1OGQtYjkwNC0xYjY5ZDAyNGU0ZTUiLCJzdGF0dXMiOiJub3JtYWwiLCJzdWIiOiIxNjIyIiwic2NwIjoidGVuYW50IiwiYXVkIjpudWxsLCJpYXQiOjE2NzMyODc0NjEsImV4cCI6MTY3Mzg5MjI2MX0.Vlh6i6Or-hozQHfow6tgUGRJqS8uNfZ6EVW81nY-HgM';

                const proxyUrl = 'https://tcp.parking.kakao.com/';
                // const proxyAgent = new HttpProxyAgent(proxyUrl);

                const token = {
                    headers: {
                        Authorization: "Bearer " + authToken,
                        // httpAgent: proxyAgent,
                        'Access-Control-Allow-Origin': 'https://tcp.parking.kakao.com/'
                    }
                };

                const headers = {
                    'Authorization': 'Bearer ' + authToken
                };

                const corsOptions = {
                    origin: 'https://tcp.kakaomobility.com',
                    optionsSuccessStatus: 200
                }

                Axios.get(searchCarUrl, token)
                    .then((searchCarResponse)=>{

                        console.log('Search Car Response : ', searchCarResponse); //
                        if(searchCarResponse.status == 200) {
                            if(searchCarResponse.data.length != 0) {
                                searchCarResponse.data.forEach(Car=>{
                                    if(Car.plate_number == parkedCarNumber){
                                        carId = Car.id;
                                        console.log('cardId : ', carId); //
                                    }                
                                });
                                console.log('cardId :: ', carId); //

                                return Axios.put(updateParkingLotUrl, updateParkingLotData, {headers});
                            }else{
                                alert('Car Not Found in Parking!');
                                process.exit();
                            }
                        }else{
                            alert('Some Technical Error Occured!');
                            process.exit();
                        }
                })
                .then((updateParkingLotResponse)=>{
                    console.log('Update Parking Lot Response : ', updateParkingLotResponse); //
                    if(updateParkingLotResponse.status == 200) {
                        if(updateParkingLotResponse.data !== '' && updateParkingLotResponse.data.constructor === Object) {

                            var discountHistoryUrl = 'https://tcp.parking.kakao.com/api/tenants/v1/in_out_logs/' + carId + '/discount_history';
                    
                            return Axios.get(discountHistoryUrl, token);
                        }else{
                            alert('Some Technical Error Occured!');
                            process.exit();
                        }
                    }else{
                        alert('Some Technical Error Occured!');
                        process.exit();
                    }
                })
                .then((discountHistoryResponse)=>{
                    console.log('Discount History Response : ', discountHistoryResponse); //
                    if(discountHistoryResponse.status == 200) {
                        if(discountHistoryResponse.data !== '' && discountHistoryResponse.data.constructor === Object) {

                            var discountUrl = 'https://tcp.parking.kakao.com/api/tenants/v1/in_out_logs/' + carId + '/discount';
                            var discountItemId = discountHistoryResponse.data.own_discount[0].discount_item_id;
                            var discountData = { discount_item_id: discountItemId };
                    
                            return Axios.post(discountUrl, discountData, {headers});
                        }else{
                            alert('Some Technical Error Occured!');
                            process.exit();
                        }
                    }else{
                        alert('Some Technical Error Occured!');
                        process.exit();
                    }
                })
                .then((discountResponse)=>{
                    console.log('Discount Response : ', discountResponse); //
                    if(discountResponse.status == 200) {
                        if(discountResponse.data !== '' && discountResponse.data.constructor === Object) {

                            var authKey = discountResponse.config.headers.Authorization;
                            authKey = authKey.substring(7);
                            console.log(authKey);
                            updateAuth(authKey);
                            updateTicket();
                            alert('Parking Ticket Successfully Created!');

                        }else{
                            alert('Some Technical Error Occured!');
                            process.exit();
                        }

                    }else{
                        alert('Some Technical Error Occured!');
                        process.exit();
                    }
                })
                .catch(error => {
                    console.log('Some Technical Error Occured!!');
                  });
            }else{
                alert('No Parking Ticket Available for this Car : ' + parkedCarNumber);
            }
            /* ====== End of Http Calls if Parking Ticket value is > 0 ====== */
        });
        //End of checking available Parking ticket
    }

    const downloadData = (checkDate) => {
        const dbRef = ref(getDatabase());
        get(child(dbRef, `/${checkDate}`)).then((snapshot) => {
          const data = snapshot.val();
          let arrOfObj = [];
          Object.entries(data).map(([key, val]) => arrOfObj.push(val,));
          arrOfObj.sort((a,b) => (a.ParkingTime > b.ParkingTime) ? 1 : ((b.ParkingTime > a.ParkingTime) ? -1 : 0));
        //   console.log('arrOfObj : ', arrOfObj); //
          let Heading = [['차량번호', '이름', '주차 날짜', '주차시간', '전화번호', '최종 주차권 결제 시간', '비고', '총 주차권 수', '잔여 주차권']];
          const ws = XLSX.utils.json_to_sheet(arrOfObj);
          const wb = XLSX.utils.book_new();
          XLSX.utils.sheet_add_aoa(ws, Heading);
          XLSX.utils.book_append_sheet(wb, ws, checkDate);
          const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      
          // Generate a file name
          const fileName = 'ParkingData_' + checkDate + '.xlsx';
      
          // Generate the excel file
          FileSaver.saveAs(new Blob([excelBuffer]), fileName);

        });
    }


    return(
      <div className="form" >
          <div className="row form-body" >
                <div className="row col-5 d-flex justify-content-center text-white">
                    <label className="form__label" htmlFor="name">이름 </label>
                    <input className="form__input" type="text" id="name" value={name} onChange = {(e) => handleInputChange(e)} placeholder="이름" />
                </div>
                <div className="row col-5 d-flex justify-content-center text-white">
                    <label className="form__label" htmlFor="phone">전화번호 </label>
                    <input className="form__input" type="number" id="phone" value={phone} onChange = {(e) => handleInputChange(e)} placeholder="전화번호" />
                </div>
                <div className="row col-5 d-flex justify-content-center text-white">
                    <label className="form__label" htmlFor="totalTicket" style={{'fontSize':'28px'}} >총 주차권 수 </label>
                    <input className="form__input" type="number"  id="totalTicket" value={totalTicket} onChange = {(e) => handleInputChange(e)} placeholder="총 주차권 수 (<=2)" min='1' max='2' />
                </div>
                <div className="row col-5 d-flex justify-content-center text-white">
                    <label className="form__label" htmlFor="carNumber">차량번호 </label>
                    <input className="form__input" type="text" id="carNumber" value={carNumber} onChange = {(e) => handleInputChange(e)} placeholder="차량번호" />
                </div>
                <div className="row col-5 d-flex justify-content-center text-white">
                    <label className="form__label" htmlFor="etc">비고 </label>
                    <input className="form__input" type="text" id="remarks" value={remarks} onChange = {(e) => handleInputChange(e)} placeholder="비고"/>
                </div>
          </div>
          <div className="footer1" >
                <button onClick={()=>handleCarPark()} type="submit" className="btn btn-info btn-lg text-white" style={{'width':'20%'}} > 확인 </button>
          </div>
              <br/> <br/> <br/> <br/> <br/> <br/> <br/> <br/> <br/> <br/> <br/> <br/>
          <div className="form-body" hidden>
                <div className="parkedCar text-white">
                    <label className="form__label" htmlFor="parkedCar" >차량번호 </label>
                    <input className="form__input" type="text" id="parkedCarNumber" value={parkedCarNumber} onChange = {(e) => handleInputChange(e)} placeholder="차량번호"  />
                    <button onClick={()=>handleParkingPayment(parkedCarNumber)} type="submit" className="btn btn-info  btn-lg" >결제하기</button>
                </div>
          </div> 

          <div className="form-body">
                <div className="downloadExcel col-6 text-white">
                    <label className="form__label" htmlFor="checkDate">주차시간</label>
                    <input className="form__input text-white" type="date" id="checkDate" value={checkDate} onChange = {(e) => handleInputChange(e)} />
                    <button onClick={()=>downloadData(checkDate)} type="submit" className="btn btn-info  btn-lg text-white" >주차내역 다운받기</button>
                </div>
          </div> 
      </div>
      
    )       
}
export default CarParkDetail;
