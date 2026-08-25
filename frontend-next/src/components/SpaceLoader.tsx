"use client";

import React from 'react';

interface SpaceLoaderProps {
  fullScreen?: boolean;
  text?: string;
  scale?: number;
  className?: string;
}

export default function SpaceLoader({ 
  fullScreen = false, 
  text = "...loading...", 
  scale = 1,
  className = "" 
}: SpaceLoaderProps) {
  return (
    <div className={`flex items-center justify-center ${fullScreen ? 'fixed inset-0 z-50 bg-inherit min-h-screen w-full' : 'w-full h-full min-h-[350px] bg-transparent'} ${className}`}>
      <style jsx>{`
        .space-loader-container {
          display: flex;
          height: 370px;
          width: 370px;
          justify-content: center;
          align-items: center;
          position: relative;
          flex-direction: column;
          transform: scale(${scale});
          transform-origin: center center;
        }

        .space-loader-moon {
          background-color: #f8fafc;
          height: 170px;
          width: 170px;
          border-radius: 50%;
          position: absolute;
          margin: auto;
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          overflow: hidden;
          box-shadow: 0 0 35px rgba(255, 255, 255, 0.25);
        }

        .space-loader-crater {
          background-color: #e2e8f0;
          height: 30px;
          width: 30px;
          border-radius: 50%;
          position: relative;
        }
        .space-loader-crater:before {
          content: "";
          position: absolute;
          height: 25px;
          width: 25px;
          border-radius: 50%;
          box-shadow: -5px 0 0 2px #cbd5e1;
          top: 2px;
          left: 7px;
        }
        .crater1 {
          top: 27px;
          left: 90px;
          transform: scale(0.9);
        }
        .crater2 {
          bottom: 15px;
          left: 61px;
          transform: scale(0.6);
        }
        .crater3 {
          left: 15px;
          transform: scale(0.75);
        }
        .crater4 {
          left: 107px;
          top: 32px;
          transform: scale(1.18);
        }
        .crater5 {
          left: 33px;
          bottom: 4px;
          transform: scale(0.65);
        }

        .space-loader-shadow {
          height: 190px;
          width: 190px;
          box-shadow: 21px 0 0 5px rgba(0, 0, 0, 0.08);
          border-radius: 50%;
          position: relative;
          bottom: 157.5px;
          right: 46px;
        }

        .space-loader-eye {
          background-color: #1e1e24;
          height: 12px;
          width: 12px;
          position: relative;
          border-radius: 50%;
        }
        .eye-l {
          bottom: 255px;
          left: 59px;
        }
        .eye-r {
          bottom: 267px;
          left: 101px;
        }

        .space-loader-mouth {
          height: 5px;
          width: 10px;
          border: 3px solid #1e1e24;
          position: relative;
          bottom: 262px;
          left: 79px;
          border-top: none;
          border-radius: 0 0 10px 10px;
        }

        .space-loader-blush {
          background-color: #fca5a5;
          height: 7.5px;
          width: 7.5px;
          position: relative;
          border-radius: 50%;
          opacity: 0.8;
        }
        .blush1 {
          bottom: 273px;
          left: 50px;
        }
        .blush2 {
          bottom: 281px;
          left: 115px;
        }

        .space-loader-orbit {
          height: 280px;
          width: 280px;
          border-radius: 50%;
          position: absolute;
          margin: auto;
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          animation: orbit-spin 10s infinite linear;
        }
        @keyframes orbit-spin {
          100% {
            transform: rotate(360deg);
          }
        }

        .space-loader-rocket {
          background-color: #fafcf7;
          height: 50px;
          width: 25px;
          border-radius: 50% 50% 0 0;
          position: relative;
          left: -11px;
          top: 112px;
          overflow: visible;
        }

        .space-loader-rocket:before {
          content: "";
          position: absolute;
          background-color: #ff912d;
          height: 20px;
          width: 55px;
          border-radius: 50% 50% 0 0;
          z-index: -1;
          right: -15px;
          bottom: 0;
        }

        .space-loader-rocket:after {
          content: "";
          position: absolute;
          background-color: #ff912d;
          height: 4px;
          width: 15px;
          border-radius: 0 0 2px 2px;
          bottom: -4px;
          left: 4.3px;
        }

        .space-loader-rocket .fire {
          position: absolute;
          bottom: -20px;
          left: 50%;
          transform: translateX(-50%);
          width: 12px;
          height: 30px;
          background: radial-gradient(
            ellipse at center,
            #ffec85 0%,
            #ffae34 40%,
            #ec760c 70%,
            #cd4606 90%,
            rgba(0, 0, 0, 0) 100%
          );
          border-radius: 50%;
          animation: flame-anim 0.3s infinite alternate;
          z-index: -1;
        }

        @keyframes flame-anim {
          0% {
            transform: translateX(-50%) scaleY(1);
            opacity: 0.9;
          }
          100% {
            transform: translateX(-50%) scaleY(1.4);
            opacity: 0.5;
          }
        }

        .space-loader-rocket .gas {
          position: absolute;
          bottom: -35px;
          left: 50%;
          transform: translateX(-50%);
          width: 10px;
          height: 10px;
          background: rgba(200, 200, 200, 0.6);
          border-radius: 50%;
          animation: gas-anim 1.5s infinite ease-out;
        }
        .space-loader-rocket .gas:nth-child(3) {
          animation-delay: 0.3s;
          left: 40%;
        }
        .space-loader-rocket .gas:nth-child(4) {
          animation-delay: 0.6s;
          left: 60%;
        }

        @keyframes gas-anim {
          0% {
            transform: translateX(-50%) scale(0.5);
            opacity: 0.8;
          }
          100% {
            transform: translateX(-50%) translateY(40px) scale(1.8);
            opacity: 0;
          }
        }

        .space-loader-window {
          background-color: #151845;
          height: 10px;
          width: 10px;
          border: 2px solid #b8d2ec;
          border-radius: 50%;
          position: relative;
          top: 17px;
          left: 5px;
        }

        .space-loader-curve {
          width: 100%;
          height: 100%;
          position: absolute;
          animation: curve-rotate 10s linear infinite;
          fill: transparent;
        }
        @keyframes curve-rotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .space-loader-curve text {
          letter-spacing: 16px;
          text-transform: uppercase;
          font-weight: 700;
          font-family: var(--font-montserrat, sans-serif);
          font-size: 1.25em;
          fill: #ffc107;
          filter: drop-shadow(0 2px 8px rgba(255, 145, 45, 0.6));
        }
      `}</style>

      <div className="space-loader-container">
        <div className="space-loader-moon">
          <div className="space-loader-crater crater1"></div>
          <div className="space-loader-crater crater2"></div>
          <div className="space-loader-crater crater3"></div>
          <div className="space-loader-crater crater4"></div>
          <div className="space-loader-crater crater5"></div>
          <div className="space-loader-shadow"></div>
          <div className="space-loader-eye eye-l"></div>
          <div className="space-loader-eye eye-r"></div>
          <div className="space-loader-mouth"></div>
          <div className="space-loader-blush blush1"></div>
          <div className="space-loader-blush blush2"></div>
        </div>

        <div className="space-loader-orbit">
          <div className="space-loader-rocket">
            <div className="space-loader-window"></div>
            <div className="fire"></div>
            <div className="gas"></div>
            <div className="gas"></div>
            <div className="gas"></div>
            <div className="gas"></div>
            <div className="gas"></div>
            <div className="gas"></div>
            <div className="gas"></div>
          </div>
        </div>

        <div className="space-loader-curve">
          <svg viewBox="0 0 500 500">
            <path
              id="loader-path"
              d="M73.2,148.6c4-6.1,65.5-96.8,178.6-95.6c111.3,1.2,170.8,90.3,175.1,97"
            ></path>
            <text width="500">
              <textPath href="#loader-path">{text}</textPath>
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
}
