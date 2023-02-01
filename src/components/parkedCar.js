import StartFirebase from '../firebase';
import React from 'react';
import {ref, onValue} from 'firebase/database';
import {Table} from 'react-bootstrap';
import {getCurrentDate} from './utils';

const db = StartFirebase();

export class RealtimeData extends React.Component {
    
    constructor(){
        super();
        this.state = {
            tableData: []
        }
    }

    componentDidMount(){
        const dbRef = ref(db, getCurrentDate());
        onValue(dbRef, (snapshot)=>{
            let records = [];
            snapshot.forEach(childSnapshot=>{
                let keyName = childSnapshot.key;
                let data = childSnapshot.val();
                records.push({"key": keyName, "data": data});
            });
            this.setState({tableData:records});
        });
    }

    render(){
        return(
            <Table className='' bordered striped variant='dark'>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>이름</th>
                        <th>전화번호</th>
                        <th>총 주차권 수</th>
                        <th>잔여 주차권</th>
                        <th>최종 주차권 결제 시간</th>
                        <th>차량번호</th>
                        <th>주차 날짜</th>
                        <th>주차시간</th>
                        <th>비고</th>
                    </tr>
                </thead>
                <tbody>
                    {this.state.tableData.map((row, index)=>{
                        return(
                            <tr key={index}>
                                <td>{index+1}</td>
                                <td>{row.data.FullName}</td>
                                <td>{row.data.PhoneNumber}</td>
                                <td>{row.data.TotalTicket}</td>
                                <td>{row.data.UpdatedTicket}</td>
                                <td>{row.data.PreviousTicketCheckinTime}</td>
                                <td>{row.data.CarNumber}</td>
                                <td>{row.data.ParkingDate}</td>
                                <td>{row.data.ParkingTime}</td>
                                <td>{row.data.Remarks}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </Table>
        )
    }

}