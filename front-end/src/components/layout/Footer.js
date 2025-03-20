// src/components/layout/Footer.js
import React from "react";

const Footer = () => {
  return (
    <footer className="bg-blue-200 text-black py-6">
      {" "}
      {/* Đổi màu nền thành xanh nước biển nhạt */}
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold">Hệ thống quản lý thư viện</h3>
            <p className="text-gray-600">Quản lý sách và mượn sách hiệu quả</p>
          </div>

          <div className="text-center md:text-right">
            <p className="text-gray-600">
              &copy; {new Date().getFullYear()} Library System. All rights
              reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
