"use client";
import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { countries } from "../../../utils/coutnries";

// Currency mapping for countries
const currencyMap: Record<string, string> = {
  IN: "INR",
  US: "USD",
  GB: "GBP",
  AU: "AUD",
  CA: "CAD",
  SG: "SGD",
  AE: "AED",
  // Add more as needed
};

interface BankAccountFormProps {
  sellerId: string;
  sellerCountry?: string;
  setActiveStep: (step: number) => void;
}

const BankAccountForm: React.FC<BankAccountFormProps> = ({
  sellerId,
  sellerCountry,
  setActiveStep,
}) => {
  const [isTestMode, setIsTestMode] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      bankAccountCountry: sellerCountry || "IN",
      accountNumber: "",
      confirmAccountNumber: "",
    },
  });

  const selectedCountry = watch("bankAccountCountry");
  const accountNumber = watch("accountNumber");
  const currency = useMemo(
    () => currencyMap[selectedCountry] || "INR",
    [selectedCountry]
  );

  // Generate random 8-digit account number
  const generateAccountNumber = () => {
    const randomNum = Math.floor(10000000 + Math.random() * 90000000);
    return randomNum.toString();
  };

  // Handle test account button click
  const handleUseTestAccount = () => {
    const testAccountNum = generateAccountNumber();
    setValue("bankAccountCountry", "IN");
    setValue("accountNumber", testAccountNum);
    setValue("confirmAccountNumber", testAccountNum);
    setIsTestMode(true);
  };

  // Reset form when user manually changes country (exit test mode)
  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (isTestMode) {
      setIsTestMode(false);
      setValue("accountNumber", "");
      setValue("confirmAccountNumber", "");
    }
  };

  const connectBankMutation = useMutation({
    mutationFn: async (data: {
      bankAccountCountry: string;
      accountCurrency: string;
      accountNumber: string;
      sellerId: string;
    }) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/create-bank-account`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      window.location.href = "/success";
    },
  });

  const onSubmit = async (data: any) => {
    connectBankMutation.mutate({
      bankAccountCountry: data.bankAccountCountry,
      accountCurrency: currency,
      accountNumber: data.accountNumber,
      sellerId,
    });
  };

  return (
    <div>
      <h3 className="text-2xl font-semibold text-center mb-6">Connect Bank Account</h3>

      {/* Test Account Button */}
      <button
        type="button"
        onClick={handleUseTestAccount}
        className="w-full mb-6 px-4 py-2 bg-blue-100 text-blue-600 border border-blue-300 rounded-[4px] hover:bg-blue-200 font-medium"
      >
        Use Test Account (India, INR)
      </button>

      <form onSubmit={handleSubmit(onSubmit)}>
        <label className="block text-gray-700 mb-1 font-medium">Bank Account Country</label>
        <select
          className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-4"
          {...register("bankAccountCountry", {
            required: "Country is required",
          })}
          onChange={(e) => {
            handleCountryChange(e);
            register("bankAccountCountry").onChange?.(e);
          }}
        >
          {countries.map((country: any) => (
            <option value={country.code} key={country.code}>
              {country.name}
            </option>
          ))}
        </select>
        {errors.bankAccountCountry && (
          <p className="text-red-500 text-sm mb-3">
            {String(errors.bankAccountCountry.message)}
          </p>
        )}

        <label className="block text-gray-700 mb-1 font-medium">Currency</label>
        <input
          type="text"
          readOnly
          value={currency}
          className="w-full p-2 border border-gray-300 bg-gray-100 rounded-[4px] mb-4 cursor-not-allowed"
        />

        <label className="block text-gray-700 mb-1 font-medium">Account Number</label>
        <input
          type="text"
          placeholder="Enter your 8-digit account number"
          {...register("accountNumber", {
            required: "Account number is required",
            pattern: {
              value: /^\d{8}$/,
              message: "Account number must be exactly 8 digits",
            },
          })}
          className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-3"
        />
        {errors.accountNumber && (
          <p className="text-red-500 text-sm mb-3">
            {String(errors.accountNumber.message)}
          </p>
        )}

        <label className="block text-gray-700 mb-1 font-medium">Confirm Account Number</label>
        <input
          type="text"
          placeholder="Re-enter your account number"
          {...register("confirmAccountNumber", {
            required: "Confirmation is required",
            validate: (value) =>
              value === accountNumber || "Account numbers do not match",
          })}
          className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-4"
        />
        {errors.confirmAccountNumber && (
          <p className="text-red-500 text-sm mb-3">
            {String(errors.confirmAccountNumber.message)}
          </p>
        )}

        <div className="bg-gray-50 p-3 rounded-[4px] mb-4 text-xs text-gray-600">
          <p className="leading-relaxed">
            <strong>Legal Disclaimer:</strong> By connecting your bank account, you authorize 
            TradePort to process payments and transfers on your behalf. Your bank account information 
            will be securely stored and used solely for settlement purposes. You agree to our terms 
            of service and privacy policy.
          </p>
        </div>

        <button
          type="submit"
          disabled={connectBankMutation.isPending}
          className="w-full cursor-pointer bg-black text-white py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50"
        >
          {connectBankMutation.isPending ? "Connecting..." : "Connect Bank Account"}
        </button>

        {connectBankMutation.isError && connectBankMutation.error instanceof AxiosError && (
          <p className="text-red-500 text-sm mt-3">
            {connectBankMutation.error.response?.data?.message ||
              connectBankMutation.error.message}
          </p>
        )}
      </form>
    </div>
  );
};

export default BankAccountForm;
