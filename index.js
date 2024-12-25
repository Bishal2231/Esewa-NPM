
import axios from "axios";

import crypto from "crypto"

function generateHmacSha256Hash(data, secret,algorithm,encoding) {
    if (!data || !secret) {
      throw new Error("Both data and secret are required to generate a hash.");
    }
  
    // Create HMAC SHA256 hash and encode it in Base64
    const hash = crypto
      .createHmac(algorithm, secret)
      .update(data)
      .digest(encoding);
  
    return hash;
  }

function safeStringify(obj) {
    const cache = new Set();
    const jsonString = JSON.stringify(obj, (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (cache.has(value)) {
          return; // Discard circular reference
        }
        cache.add(value);
      }
      return value;
    });
    return jsonString;
  }
const   EsewaPaymentGateway=async(amount,productDeliveryCharge,productServiceCharge,taxAmount,transaction_uuid,
  product_code,SECRET,success_url,failure_url,ESEWAPAYMENT_URL,algorithm="sha256",encoding="base64")=>{
    let paymentData = {
      amount,
      failure_url,
      product_delivery_charge:productDeliveryCharge,
      product_service_charge:productServiceCharge,
      product_code ,
      signed_field_names: "total_amount,transaction_uuid,product_code",
      success_url,
      tax_amount:taxAmount,
      total_amount: Number(amount)+productDeliveryCharge+productServiceCharge+taxAmount,
      transaction_uuid,
    };
    const data = `total_amount=${paymentData.total_amount},transaction_uuid=${paymentData.transaction_uuid},product_code=${paymentData.product_code}`;
  
  
    const signature = generateHmacSha256Hash(data, SECRET,algorithm,encoding);
    paymentData = { ...paymentData, signature };
  
    try {
      const payment = await axios.post(ESEWAPAYMENT_URL, null, {
        params: paymentData,
      });
     if(!payment){
        return res.json({status:400,messege:"failed payment"})
     }
      const reqPayment = JSON.parse(safeStringify(payment));
  
  return reqPayment;
  
     } catch (error) {
        console.log(error)
      return res.status(400).json("error seding data")
  
  

      }
  
  
  }


const EsewaCheckStatus=async(total_amount,transaction_uuid,product_code,ESEWAPAYMENT_STATUS_CHECK_URL)=>{
    const paymentData = {
      product_code,
      total_amount,
      transaction_uuid,
    };
    const response = await axios.get(
      ESEWAPAYMENT_STATUS_CHECK_URL,
      {
        params: paymentData,
      }
    );
    if(!response){
      return res.json({status:400,success:false,message:"error getting response "})
    }
    const paymentStatusCheck = JSON.parse(safeStringify(response));
    return paymentStatusCheck;
  }



function base64Decode(base64) {
    // Convert Base64Url to standard Base64
    const standardBase64 = base64.replace(/-/g, "+").replace(/_/g, "/");
    // Decode Base64 to UTF-8 string
    const decoded = atob(standardBase64);
    return JSON.parse(decoded);
  }
   function generateUniqueId() {
    return `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  export {EsewaPaymentGateway,EsewaCheckStatus,base64Decode,generateUniqueId} 