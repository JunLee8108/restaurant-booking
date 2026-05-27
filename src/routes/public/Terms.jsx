import Nav from "../../components/shared/Nav";
import Footer from "../../components/shared/Footer";
import "./terms.css";

export default function Terms() {
  return (
    <div className="terms-page">
      <Nav />
      <main className="terms-main">
        <div className="container terms-wrap">
          <header className="terms-head">
            <div className="eyebrow">Terms &amp; Privacy</div>
            <h1 className="terms-title">
              약관 및 <span className="italic">개인정보 처리방침</span>
            </h1>
            <p className="terms-lead">
              La Stella 예약 서비스 이용을 위한 약관과 개인정보 수집·이용 및 제3자
              제공에 관한 안내입니다.
            </p>
          </header>

          <section className="terms-section">
            <h2 className="terms-h">1. 예약 서비스 이용약관</h2>
            <ol className="terms-list">
              <li>
                본 약관은 La Stella(이하 "레스토랑")가 제공하는 온라인 예약
                서비스의 이용 조건과 절차를 규정합니다.
              </li>
              <li>
                예약은 신청 후 레스토랑의 확정 연락(전화)으로 완료되며, 신청
                자체가 확정을 의미하지 않습니다.
              </li>
              <li>
                예약의 변경 및 취소는 방문 24시간 전까지 가능합니다. 무단 노쇼가
                반복될 경우 향후 예약이 제한될 수 있습니다.
              </li>
              <li>
                성수기 특선 부페 요금은 예약 시점에 따라 상이하게 적용될 수
                있으며, 현장 결제 시 안내된 금액을 기준으로 합니다.
              </li>
            </ol>
          </section>

          <section className="terms-section">
            <h2 className="terms-h">2. 개인정보 수집 및 이용 동의</h2>
            <p className="terms-p">
              레스토랑은 예약 접수 및 응대를 위하여 아래와 같이 최소한의
              개인정보를 수집·이용합니다.
            </p>
            <table className="terms-table">
              <tbody>
                <tr>
                  <th>수집 항목</th>
                  <td>예약자 성명, 휴대전화 번호, 예약 정보(방문일·인원), 요청 사항</td>
                </tr>
                <tr>
                  <th>수집 목적</th>
                  <td>예약 확인 및 확정 연락, 예약 변경·취소 응대, 방문 관리</td>
                </tr>
                <tr>
                  <th>보유·이용 기간</th>
                  <td>
                    수집일로부터 1년 또는 관련 법령에서 정한 기간까지 보관 후
                    파기
                  </td>
                </tr>
              </tbody>
            </table>
            <p className="terms-fine">
              ※ 귀하는 개인정보 수집·이용에 동의하지 않을 권리가 있으나, 동의를
              거부할 경우 예약 서비스 이용이 제한됩니다.
            </p>
          </section>

          <section className="terms-section">
            <h2 className="terms-h">3. 개인정보 제3자 제공</h2>
            <p className="terms-p">
              레스토랑은 원활한 예약 서비스 제공을 위하여 필요한 범위 내에서
              아래와 같이 개인정보를 제3자에게 제공할 수 있습니다.
            </p>
            <table className="terms-table">
              <tbody>
                <tr>
                  <th>제공받는 자</th>
                  <td>예약 데이터 처리 위탁사(클라우드 인프라 제공자 등)</td>
                </tr>
                <tr>
                  <th>제공 항목</th>
                  <td>예약자 성명, 휴대전화 번호, 예약 정보</td>
                </tr>
                <tr>
                  <th>제공 목적</th>
                  <td>예약 데이터의 저장·관리 및 서비스 운영</td>
                </tr>
                <tr>
                  <th>보유 기간</th>
                  <td>제공 목적 달성 시 또는 보유 기간 경과 시까지</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="terms-section">
            <h2 className="terms-h">4. 문의</h2>
            <p className="terms-p">
              개인정보 처리 및 약관에 관한 문의는 아래로 연락 주시기 바랍니다.
            </p>
            <p className="terms-p">
              La Stella · <a href="tel:+82215881234">02 1588 1234</a> ·{" "}
              <a href="mailto:reserve@lastella.kr">reserve@lastella.kr</a>
            </p>
            <p className="terms-fine">
              본 방침의 구체적 내용(상호·연락처·위탁사 등)은 레스토랑 운영 정책에
              따라 변경될 수 있습니다.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
