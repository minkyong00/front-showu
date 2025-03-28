import { useEffect, useState } from "react";
import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";
import S from "./style";
import { useNavigate } from "react-router-dom";

const generateRandomString = () => window.btoa(Math.random()).slice(0, 20);
const clientKey = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";

const TossPayment = ({
  productPrice,
  orderName,
  showId,
  date,
  time,
  seatNumbers,
  userId,
  onPaymentSuccess,
}) => {
  const [widgets, setWidgets] = useState(null);

  useEffect(() => {
    async function fetchPaymentWidgets() {
      const tossPayments = await loadTossPayments(clientKey);
      const widgets = tossPayments.widgets({ customerKey: ANONYMOUS });
      setWidgets(widgets);
    }
    fetchPaymentWidgets();
  }, []);

  useEffect(() => {
    async function renderPaymentWidgets() {
      if (widgets == null) return;
      const amount = { currency: "KRW", value: productPrice };
      await widgets.setAmount(amount);
      await Promise.all([
        widgets.renderPaymentMethods({
          selector: "#payment-method",
          variantKey: "DEFAULT",
        }),
        widgets.renderAgreement({
          selector: "#agreement",
          variantKey: "AGREEMENT",
        }),
      ]);
    }
    renderPaymentWidgets();
  }, [widgets, productPrice]);

  const navigate = useNavigate();

  const handlePaymentSuccess = async (paymentKey, orderId) => {
    console.log("handlePaymentSuccess 데이터:", {
      paymentKey,
      orderId,
      amount: productPrice,
      orderName,
      showId,
      date,
      time,
      seatNumbers,
      userId,
    });

    try {
      const response = await fetch("http://localhost:8000/reservation/toss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentKey,
          orderId,
          amount: productPrice,
          orderName,
          showId,
          date,
          time,
          seatNumbers,
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error("결제 확인 중 오류 발생");
      }

      console.log("결제 확인 성공 데이터:", await response.json());

      navigate(
        `/reservation/toss-payment/success?paymentKey=${encodeURIComponent(
          paymentKey
        )}&orderId=${orderId}`
      );
      if (onPaymentSuccess) onPaymentSuccess();
    } catch (error) {
      console.error("결제 확인 중 오류 발생:", error);
      navigate("/reservation/toss-payment/failed");
    }
  };

  const handlePaymentRequest = async () => {
    try {
      const paymentKey = generateRandomString();
      const orderId = generateRandomString();
      const successUrl = `${
        window.location.origin
      }/reservation/toss-payment/success?paymentKey=${paymentKey}&orderId=${orderId}&amount=${productPrice}&orderName=${encodeURIComponent(
        orderName
      )}&showId=${showId}&date=${date}&time=${time}&seatNumbers=${encodeURIComponent(
        JSON.stringify(seatNumbers)
      )}&userId=${userId}`;
      const failUrl = `${window.location.origin}/reservation/toss-payment/failed`;

      console.log("결제 요청 데이터:", {
        paymentKey,
        orderId,
        amount: productPrice,
        orderName,
        showId,
        date,
        time,
        seatNumbers,
        userId,
      });

      await widgets?.requestPayment({
        orderId: orderId,
        orderName,
        successUrl,
        failUrl,
      });

      handlePaymentSuccess(paymentKey, orderId);
    } catch (error) {
      console.error("결제 오류:", error);
      alert("결제 중 오류가 발생했습니다.");
    }
  };

  return (
    <div>
      <S.Modal>
        <div id="payment-method" />
        <div id="agreement" />
        <div className="toss-button-wrap">
          <button className="toss-button" onClick={handlePaymentRequest}>
            결제하기
          </button>
        </div>
      </S.Modal>
      <S.ModalBg />
    </div>
  );
};

export default TossPayment;
