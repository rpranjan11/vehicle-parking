import React from 'react';
function Header() {
    return(
        <nav className="bg-dark navbar-dark navbar">
            <div className="row col-12 d-flex justify-content-center text-white">
                <h1 style={{'fontSize':'90px'}} >주차권 구매자 명단</h1>
            </div>
            <div className="row col-4 d-flex justify-content-left">
                <h1 style={{'fontSize':'1rem', 'textAlign':'start'}} >* 위 계좌번호에 본인 성함으로 입금 부탁드립니다 </h1>
                <h1 style={{'fontSize':'1rem', 'textAlign':'start'}} >* 차량번호는 전부 다 적어주세요 </h1>
                <h1 style={{'fontSize':'1rem', 'textAlign':'start'}} >* 정보를 잘못 기입 하였으면 다시 신청 해주시고 비고란에 알려주세요 </h1>
                <h1 style={{'fontSize':'1rem', 'textAlign':'start'}} >* 차량 조희가 안되면 코엑스 주차사무실(02-6002-7130)으로 연락하여 차량등록 요청 해주세요 </h1>

            </div>
        </nav>
    )
}
export default Header;