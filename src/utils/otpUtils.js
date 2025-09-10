import otpGenerator from "otp-generator";

export function genOtp(length = 6){
  return otpGenerator.generate(length, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  })
}