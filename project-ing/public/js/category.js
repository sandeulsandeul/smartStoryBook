var stmnLEFT = 10; // 오른쪽 여백
var stmnGAP1 = 0; // 위쪽 여백
var stmnGAP2 = 150; // 스크롤시 브라우저 위쪽과 떨어지는 거리
var stmnBASE = 150; // 스크롤 시작위치
var stmnActivateSpeed = 35; //스크롤을 인식하는 딜레이 (숫자가 클수록 느리게 인식)
var stmnScrollSpeed = 20; //스크롤 속도 (클수록 느림)
var stmnTimer;
function RefreshStaticMenu() {
  var stmnStartPoint, stmnEndPoint;
  stmnStartPoint = parseInt(document.getElementById('STATICMENU').style.top, 10);
  stmnEndPoint = Math.max(document.documentElement.scrollTop, document.body.scrollTop) + stmnGAP2;
  if (stmnEndPoint < stmnGAP1) stmnEndPoint = stmnGAP1;
  if (stmnStartPoint != stmnEndPoint) {
    stmnScrollAmount = Math.ceil( Math.abs( stmnEndPoint - stmnStartPoint ) / 15 );
    document.getElementById('STATICMENU').style.top = parseInt(document.getElementById('STATICMENU').style.top, 10) + ( ( stmnEndPoint<stmnStartPoint ) ? -stmnScrollAmount : stmnScrollAmount ) + 'px';
    stmnRefreshTimer = stmnScrollSpeed;
  }
  stmnTimer = setTimeout("RefreshStaticMenu();", stmnActivateSpeed);
}
function InitializeStaticMenu() {
  document.getElementById('STATICMENU').style.right = stmnLEFT + 'px';  //처음에 오른쪽에 위치. left로 바꿔도.
  document.getElementById('STATICMENU').style.top = document.body.scrollTop + stmnBASE + 'px';
  RefreshStaticMenu();
}


var count = 1;
var page = 1;
 var PagingHelper = {
     'data' : {
          currentPage :1     // 현재페이지
         //,startPage : 1    // 시작페이지
         ,pageSize : 5       // 페이지 사이즈 (화면 출력 페이지 수) //->이부분 db row개수? 기반으로 수정
         ,maxListCount : 3  // (보여질)최대 리스트 수 (한페이지 출력될 항목 갯수)
         ,startnum : 1       // 시작 글번호
         ,lastnum : 10       // 마지막 글번호
         ,totalCnt : 0       // 전체 글의 갯수.
         ,totalPageCnt : 0   // 전체 페이지 수
     },
     'setOption' : function(opt){
         if( typeof opt != 'object' ) return;
         for (key in opt ) {
             if(key in this.data) {
                 this.data[key] = opt[key]; //data에 입력받은 설정값 할당.
             }
         }
     },
     'pagingHtml' : function(pTotalCnt){
         var _ = this;
         _.data['totalCnt'] = pTotalCnt?pTotalCnt:_.data['totalCnt'];
         if (_.data['totalCnt'] == 0) {
             return "";
         }
         //총페이지수 구하기 : 페이지 출력 범위 (1|2|3|4|5)
         _.data.totalPageCnt = Math.ceil(_.data.totalCnt / _.data.maxListCount);
         //현재 블럭 구하기
         var n_block = Math.ceil(_.data.currentPage / _.data.pageSize);
         //페이징의 시작페이지와 끝페이지 구하기
         var s_page = (n_block - 1) * _.data.pageSize + 1; // 현재블럭의 시작 페이지
         var e_page = n_block * _.data.pageSize; // 현재블럭의 끝 페이지
         var sb='';
         var sbTemp ='';
         //console.log(_.data);
         //console.log(n_block+"/"+s_page+"/"+e_page);
         // 블럭의 페이지 목록 및 현재페이지 강조
         for (var j = s_page; j <= e_page; j++) {
             if (j > _.data.totalPageCnt ) break;
             if(j == _.data.currentPage) {
                 sbTemp += "<li class='selected'>["+j+"]</li>";
             } else {
                 sbTemp += "<li onclick='PagingHelper.gotoPage("+j+");'>["+j+"]</li>";
             }
         }
         // 이전페이지 버튼
         sb = "<ul>"
         if(_.data.currentPage > s_page || _.data.totalCnt > _.data.maxListCount && s_page > 1){
             sb += "<li class='first' onclick='PagingHelper.gotoPage(1);'>처음</li >"
             sb += "<li class='previous' onclick='PagingHelper.gotoPage(" + (_.data.currentPage - 1) + ");'>이전</li>"
         }
         // 현재블럭의 페이지 목록
         sb += sbTemp
         // 다음페이지 버튼
         if(_.data.currentPage < _.data.totalPageCnt ){
             sb += "<li class='next' onclick='PagingHelper.gotoPage(" + (_.data.currentPage + 1) + ");'>다음</li>"
             sb += "<li class='last' onclick='PagingHelper.gotoPage(" + (_.data.totalPageCnt) +");'>마지막</li >"
         }
         sb += "</ul>";
         return sb;
     },
     'setStartnumEndnum' : function() {
         // 시작 글번호
         this.data.startnum = (this.data.currentPage -1) * this.data.maxListCount + 1;
         // 마지막 글번호
         var tmp = this.data.currentPage * this.data.maxListCount;
         this.data.lastnum = (tmp > this.data.totalCnt?this.data.totalCnt:tmp);
     },
     'gotoPage':function(pageNum){
         console.log(pageNum);
         this.data.currentPage = pageNum; //입력받은 페이지번호를 현재페이지로 설정
         this.setStartnumEndnum();    //입력받은 페이지의 startnum과 endnum구하기
         //리스트 불러오는 ajax호출
        page = this.data.currentPage;
        $.ajax({
            url:'./CategoryContent' + id,
            type: 'GET',
            async: false,
            data:{
              page: page
            },
            dataType: 'text',
            success:function(data){
              $.get("CategoryContent4?page="+page, function(data){
                alert("success");
              }, 'json')
                $('#content').html(data);//page별 content 출력
              //$('#time').append(data);//#time 자리에 data를 계속 붙여나감
            }
        })
         //////////////////////////
        $("#paging").html(this.pagingHtml());//주석 처리하면 클릭되고 입력도 잘 들어가는데 현재 페이지 표시하는 게 1페이지로 머물러 있음.
     }
 }
/////////////////////////////////////////////////////////////////////
//테스트용 : 임시로 총레코드수 설정.
////////////////////////////////////////////////////////////////////
//PagingHelper.data.totalCnt = 1001;
$(document).ready(function() {
 $("#paging").append(PagingHelper.pagingHtml(<%=content.length%>));//append 안의 파라미터를 문자열로 바꾸면 페이지 번호들 출력 안됨.
 //해당 영역에 페이징 문자열 출력
 //class에대한 스타일 정의 필요.
});


var modal = document.getElementById('myModal');

// Get the button that opens the modal
var btn = document.getElementById("myBtn");


// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal
btn.onclick = function() {
  modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
      modal.style.display = "none";
  }
}
