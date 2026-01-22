"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./calculator.module.css";

type Step = "start" | "form" | "loading" | "result";

interface FormData {
  industry: string;
  revenue: string;
  debt: string;
}

interface Result {
  amount: string;
  interestRate: string;
  message: string;
}

// 다양한 결과 데이터
const resultData: Result[] = [
  { amount: "9740만원", interestRate: "2%대", message: "사장님은 최대 9740만원, 2%대 금리 대상자일 확률이 높습니다" },
  { amount: "1억 2천만원", interestRate: "1.5%대", message: "사장님은 최대 1억 2천만원, 1.5%대 금리 대상자일 확률이 높습니다" },
  { amount: "8500만원", interestRate: "2.5%대", message: "사장님은 최대 8500만원, 2.5%대 금리 대상자일 확률이 높습니다" },
  { amount: "1억 5천만원", interestRate: "1.8%대", message: "사장님은 최대 1억 5천만원, 1.8%대 금리 대상자일 확률이 높습니다" },
  { amount: "7200만원", interestRate: "2.2%대", message: "사장님은 최대 7200만원, 2.2%대 금리 대상자일 확률이 높습니다" },
  { amount: "1억 8천만원", interestRate: "1.2%대", message: "사장님은 최대 1억 8천만원, 1.2%대 금리 대상자일 확률이 높습니다" },
  { amount: "6500만원", interestRate: "2.8%대", message: "사장님은 최대 6500만원, 2.8%대 금리 대상자일 확률이 높습니다" },
  { amount: "2억원", interestRate: "1.0%대", message: "사장님은 최대 2억원, 1.0%대 금리 대상자일 확률이 높습니다" },
];

const industries = ["소매업", "음식점업", "서비스업", "제조업", "건설업", "기타"];
const revenues = ["5천만원 미만", "5천만원~1억원", "1억원~3억원", "3억원~5억원", "5억원 이상"];
const debts = ["5천만원 미만", "5천만원~1억원", "1억원~3억원", "3억원~5억원", "5억원 이상"];

export default function Calculator() {
  const [step, setStep] = useState<Step>("start");
  const [formData, setFormData] = useState<FormData>({
    industry: "",
    revenue: "",
    debt: "",
  });
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [animatedAmount, setAnimatedAmount] = useState(0);
  const [animatedRate, setAnimatedRate] = useState(0);
  const [openSelect, setOpenSelect] = useState<string | null>(null);

  const handleStart = () => {
    setStep("form");
  };

  const handleSelect = (field: keyof FormData, value: string) => {
    setFormData({ ...formData, [field]: value });
    setOpenSelect(null);
  };

  const toggleSelect = (field: string) => {
    setOpenSelect(openSelect === field ? null : field);
  };

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(`.${styles.custom_select_wrapper}`)) {
        setOpenSelect(null);
      }
    };

    if (openSelect) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [openSelect]);

  const handleSubmit = () => {
    if (!formData.industry || !formData.revenue || !formData.debt) {
      alert("모든 항목을 선택해주세요.");
      return;
    }

    setStep("loading");
    setLoadingProgress(0);

    // 로딩 애니메이션 (숫자가 올라가는 효과)
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          // 랜덤 결과 선택
          const randomResult = resultData[Math.floor(Math.random() * resultData.length)];
          setResult(randomResult);
          setTimeout(() => {
            setStep("result");
          }, 500);
          return 100;
        }
        return prev + Math.random() * 15; // 랜덤하게 올라가도록
      });
    }, 100);

    // 최대 3초 후 강제로 완료
    setTimeout(() => {
      clearInterval(interval);
      if (loadingProgress < 100) {
        const randomResult = resultData[Math.floor(Math.random() * resultData.length)];
        setResult(randomResult);
        setLoadingProgress(100);
        setTimeout(() => {
          setStep("result");
        }, 500);
      }
    }, 3000);
  };

  const handleReset = () => {
    setStep("start");
    setFormData({ industry: "", revenue: "", debt: "" });
    setLoadingProgress(0);
    setResult(null);
    setAnimatedAmount(0);
    setAnimatedRate(0);
  };

  // 금액 문자열에서 숫자 추출 (예: "9740만원" -> 9740, "1억 2천만원" -> 12000)
  const parseAmount = (amountStr: string): number => {
    // "1억 2천만원" 형식 처리
    const eokManMatch = amountStr.match(/(\d+)억\s*(\d+)천만원/);
    if (eokManMatch) {
      const eok = parseFloat(eokManMatch[1]);
      const man = parseFloat(eokManMatch[2]);
      return eok * 10000 + man * 1000;
    }
    
    // "1억원" 형식 처리
    const eokMatch = amountStr.match(/(\d+)억원/);
    if (eokMatch) {
      return parseFloat(eokMatch[1]) * 10000;
    }
    
    // "9740만원" 형식 처리
    const manMatch = amountStr.match(/(\d+(?:\.\d+)?)만원/);
    if (manMatch) {
      return parseFloat(manMatch[1]);
    }
    
    return 0;
  };

  // 금리 문자열에서 숫자 추출 (예: "2%대" -> 2)
  const parseRate = (rateStr: string): number => {
    const match = rateStr.match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  };

  // 금액 포맷팅 (만원 단위로)
  const formatAmount = (value: number, originalStr: string): string => {
    const eok = Math.floor(value / 10000);
    const remainder = value % 10000;
    const man = Math.floor(remainder / 1000);
    const restMan = Math.floor(remainder % 1000);
    
    // 1억 이상이면 억 단위로 표시
    if (eok > 0) {
      if (man > 0) {
        return `${eok}억 ${man}천만원`;
      } else if (restMan > 0) {
        return `${eok}억 ${restMan}만원`;
      }
      return `${eok}억원`;
    }
    
    // 1억 미만일 때
    if (man > 0) {
      return `${man}천만원`;
    } else if (restMan > 0) {
      return `${restMan}만원`;
    }
    return "0만원";
  };

  // 금리 포맷팅
  const formatRate = (value: number): string => {
    // 소수점이 있으면 소수점 첫째자리까지, 없으면 정수로 표시
    if (value % 1 === 0) {
      return `${Math.floor(value)}%대`;
    }
    return `${value.toFixed(1)}%대`;
  };

  // 결과 애니메이션 로직 수정
  useEffect(() => {
    if (step !== "result" || !result) {
      setAnimatedAmount(0);
      setAnimatedRate(0);
      return;
    }

    const targetAmount = parseAmount(result.amount);
    const targetRate = parseRate(result.interestRate);
    
    let startTime: number;
    let animationFrameId: number;
    const duration = 1500; // 1.5초가 가장 자연스럽습니다 (토스 스타일)

    const stepAnimation = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // easeOutExpo: 처음엔 빠르고 끝은 아주 부드럽게 감속 (토스 권장 수치)
      const easing = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setAnimatedAmount(targetAmount * easing);
      setAnimatedRate(targetRate * easing);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(stepAnimation);
      }
    };

    animationFrameId = requestAnimationFrame(stepAnimation);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [step]); // result를 빼고 step만 관찰하여 중복 실행 방지

  return (
    <section className={styles.container}>
      {step === "start" && (
        <div className={styles.inner}>
          <div className={styles.header}>
            <h1 className={styles.title}>
              사장님을 위한<br />
              <span>숨은 정책자금</span> 찾기
            </h1>
            <p className={styles.subtitle}>1분 만에 예상 한도와 금리를 확인하세요</p>
          </div>
          <div className={styles.calculator_bg}>
          <img src="/calculator_bg.png" alt="calculator bg" />
          </div>
          <button className={styles.ctaButton} onClick={handleStart}>
        1분 자가진단 시작하기
          </button>
        </div>
      )}

      {step === "form" && (
        <div className={styles.inner}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>정보를 입력해주세요</h2>
          </div>
          
          <div className={styles.formGroup}>
            <div className={styles.field}>
              <label>업종</label>
              <div 
                className={styles.custom_select_wrapper}
                style={{ zIndex: openSelect === "industry" ? 1000 : 10 }}
              >
                <div 
                  className={`${styles.select_trigger} ${formData.industry ? styles.select_trigger_active : ""}`}
                  onClick={() => toggleSelect("industry")}
                >
                  <span className={formData.industry ? "" : styles.placeholder}>
                    {formData.industry || "업종 선택"}
                  </span>
                  <svg 
                    width="12" 
                    height="8" 
                    viewBox="0 0 12 8" 
                    fill="none"
                    style={{ 
                      transform: openSelect === "industry" ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s"
                    }}
                  >
                    <path 
                      d="M1 1L6 6L11 1" 
                      stroke={formData.industry ? "#3182f6" : "#b0b8c1"} 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                {openSelect === "industry" && (
                  <ul className={styles.options_list}>
                    {industries.map(i => (
                      <li
                        key={i}
                        className={styles.option_item}
                        onClick={() => handleSelect("industry", i)}
                      >
                        {i}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className={styles.field}>
              <label>연간 매출액</label>
              <div 
                className={styles.custom_select_wrapper}
                style={{ zIndex: openSelect === "revenue" ? 1000 : 10 }}
              >
                <div 
                  className={`${styles.select_trigger} ${formData.revenue ? styles.select_trigger_active : ""}`}
                  onClick={() => toggleSelect("revenue")}
                >
                  <span className={formData.revenue ? "" : styles.placeholder}>
                    {formData.revenue || "매출 규모 선택"}
                  </span>
                  <svg 
                    width="12" 
                    height="8" 
                    viewBox="0 0 12 8" 
                    fill="none"
                    style={{ 
                      transform: openSelect === "revenue" ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s"
                    }}
                  >
                    <path 
                      d="M1 1L6 6L11 1" 
                      stroke={formData.revenue ? "#3182f6" : "#b0b8c1"} 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                {openSelect === "revenue" && (
                  <ul className={styles.options_list}>
                    {revenues.map(r => (
                      <li
                        key={r}
                        className={styles.option_item}
                        onClick={() => handleSelect("revenue", r)}
                      >
                        {r}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className={styles.field}>
              <label>현재 부채</label>
              <div 
                className={styles.custom_select_wrapper}
                style={{ zIndex: openSelect === "debt" ? 1000 : 10 }}
              >
                <div 
                  className={`${styles.select_trigger} ${formData.debt ? styles.select_trigger_active : ""}`}
                  onClick={() => toggleSelect("debt")}
                >
                  <span className={formData.debt ? "" : styles.placeholder}>
                    {formData.debt || "부채 규모 선택"}
                  </span>
                  <svg 
                    width="12" 
                    height="8" 
                    viewBox="0 0 12 8" 
                    fill="none"
                    style={{ 
                      transform: openSelect === "debt" ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s"
                    }}
                  >
                    <path 
                      d="M1 1L6 6L11 1" 
                      stroke={formData.debt ? "#3182f6" : "#b0b8c1"} 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                {openSelect === "debt" && (
                  <ul className={styles.options_list}>
                    {debts.map(d => (
                      <li
                        key={d}
                        className={styles.option_item}
                        onClick={() => handleSelect("debt", d)}
                      >
                        {d}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <button 
            className={styles.ctaButton} 
            onClick={handleSubmit}
            disabled={!formData.industry || !formData.revenue || !formData.debt}
          >
            분석하기
          </button>
        </div>
      )}

      {step === "loading" && (
        <div className={styles.innerCenter}>
          <div className={styles.loader}></div>
          <h2 className={styles.loadingText}>
            사장님에게 딱 맞는<br />
            자금을 찾고 있어요
          </h2>
          <div className={styles.progressContainer}>
            <div className={styles.progressBar} style={{ width: `${loadingProgress}%` }} />
          </div>
        </div>
      )}

      {step === "result" && result && (
        <div className={styles.inner}>
          <div className={styles.resultHeader}>
            <div className={styles.checkIcon}>✓</div>
            <h2 className={styles.resultTitle}>분석이 완료되었습니다</h2>
          </div>

          <div className={styles.resultCard}>
            <div className={styles.resultRow}>
              <span className={styles.label}>예상 한도</span>
              <span className={styles.valueBlue}>{formatAmount(animatedAmount, result.amount)}</span>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.label}>최저 금리</span>
              <span className={styles.value}>연 {formatRate(animatedRate)}</span>
            </div>
          </div>

          <p className={styles.notice}>* 실제 심사 결과에 따라 차이가 발생할 수 있습니다.</p>
          
          <div className={styles.buttonGroup}>
            <button className={styles.ctaButton} onClick={handleReset}>
           
              이대로 안내받기
            </button>
          </div>
        </div>
      )}
    </section>
  );
}