import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Fragment } from "react";
import Navbar from "../components/Navbar";
import Modal from "react-modal";

export default function CancellationRefundPolicy() {
  const [modalOpen, setOpenModal] = useState(false);
  useEffect(() => {
    setOpenModal(true);
  }, []);

  return (
    <Fragment>
      <Head>
        <title>Cancellation & Refund Policy | Lille.ai</title>
      </Head>
      <Navbar />
      <div class="relative">
        <Modal
          isOpen={modalOpen}
          ariaHideApp={false}
          className="w-[100%] sm:w-[38%] max-h-[95%]"
          style={{
            overlay: {
              backgroundColor: "rgba(0,0,0,0.5)",
              zIndex: "9999",
            },
            content: {
              position: "absolute",
              top: "50%",
              left: "50%",
              right: "auto",
              border: "none",
              background: "white",
              // boxShadow: "0px 4px 20px rgba(170, 169, 184, 0.1)",
              borderRadius: "8px",
              height: "400px",
              // width: "100%",
              maxWidth: "450px",
              bottom: "",
              zIndex: "999",
              marginRight: "-50%",
              transform: "translate(-50%, -50%)",
              padding: "30px",
              paddingBottom: "0px",
            },
          }}
        >
          <div className="mx-auto pb-4">
            <img className="mx-auto h-40" src="/Cancellation.svg" />
          </div>
          <p className="text-gray-500 text-base font-medium mt-4 mx-auto pl-5">
            Detailed cancellation policy coming soon!
            <br />
            Currently if you cancel, your subscription will be active till
            subscription end date and no renewal will happen.
          </p>

          <button
            class="mt-5 ml-[25%] mx-auto w-[200px] p-4 bg-transparent text-gray-500 font-semibold py-2 px-4 border border-gray-500  rounded"
            onClick={() => {
              window.close();
            }}
          >
            Close
          </button>
        </Modal>
        <div class="absolute top-0 left-0 w-full h-full backdrop-filter backdrop-blur-sm"></div>

        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mt-8 mb-6">
            Nowigence Cancellation & Refund Policy
          </h1>
          <p className="mb-4">
            Thanks for considering the Lille.ai subscription at{" "}
            <a href="https://llle.ai" className="text-blue-500">
              https://llle.ai
            </a>{" "}
            operated by Nowigence Inc.
          </p>
          <p className="mb-4">
            We understand that you may want to cancel the subscription due to
            some unavoidable circumstances on your side, but you need to
            understand that once purchase is completed the system gets into
            action to create the account and allocate resources, so the early we
            know about the cancellation the better. Also we would like to know
            the reason of cancellation and feedback about Lille.ai if any.
          </p>
          <h2 className="text-2xl font-semibold mt-6 mb-4">
            Quick Cancellation
          </h2>
          <p className="mb-4">
            Cancellations made within 7 days of the purchase date will receive a
            70% refund. Your subscription will be active till one month from the
            day of the purchase.
          </p>
          <p className="mb-4">
            And in this case if your cancellation is because of some very
            unavoidable circumstances then we may offer you a discount for the
            future subscription after getting to know the reasons.
          </p>
          <p className="mb-4">
            Once the cancellation request is received and acknowledged the
            refund will be processed and time of refund completion will depend
            on the payment mode used by you. For the payments made by debit or
            credit cards it normally takes 7 to 10 days for the amount to reach
            the customer banks.
          </p>
          <h2 className="text-2xl font-semibold mt-6 mb-4">
            Delayed Cancellation
          </h2>
          <p className="mb-4">
            If your cancellation is after 7 days of the purchase, we won’t be
            able to refund any amount paid.
            <br />
            Your subscription will be active till one month from the day of the
            purchase.
          </p>
          <p className="mb-4">
            During the refund processing period please get in touch with the
            Sales team or write to use at{" "}
            <a href="mailto:info@nowigence.com" className="text-blue-500">
              info@nowigence.com
            </a>{" "}
            in case you have any query.
          </p>
          <h2 className="text-2xl font-semibold mt-6 mb-4">
            General refund policy
          </h2>
          <p className="mb-4">
            We offer refund as per the cancellation terms mentioned above. For
            enterprise-wide subscription please get in touch with us at{" "}
            <a href="mailto:info@nowigence.com" className="text-blue-500">
              info@nowigence.com
            </a>{" "}
            for refund related talks. If you are not satisfied with the product,
            you can get refund after certain deductions, but we would like know
            your feedback before processing the refund. You will be eligible for
            a reimbursement within 7 days once you have initiated the request
            policy mentioned above.
          </p>
          <p className="mb-4">
            No refund is allowed 7-days after the purchase. We encourage our
            customers to try the Lille.ai Platform for seven days to ensure it
            starts building the blog repository based on the topics of your
            interests. You can always get in touch with us for any help or to
            request for a demo.
          </p>
          <p className="mb-4">
            Please feel free to contact us at{" "}
            <a href="mailto:info@nowigence.com" className="text-blue-500">
              info@nowigence.com
            </a>{" "}
            for any queries you have.
          </p>
        </div>
      </div>
    </Fragment>
  );
}
