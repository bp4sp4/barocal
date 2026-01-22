"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import styles from "./page.module.css";
import Calculator from "./components/calculator";

export default function Home() {
  const [showFloatingBanner, setShowFloatingBanner] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [mainImageLoaded, setMainImageLoaded] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clickSource, setClickSource] = useState<string>("");
  const footerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const contentsSectionRef = useRef<HTMLDivElement>(null);
  const contentsSectionBlueRef = useRef<HTMLDivElement>(null);
  const contentsIconsWrapperRef = useRef<HTMLDivElement>(null);
  const newSectionRef = useRef<HTMLDivElement>(null);
  const contentsTextRef = useRef<HTMLParagraphElement>(null);
  const contentsButtonRef = useRef<HTMLParagraphElement>(null);
  const contentsImage1Ref = useRef<HTMLImageElement>(null);
  const contentsImage2Ref = useRef<HTMLImageElement>(null);
  const contentsImage3Ref = useRef<HTMLImageElement>(null);
  const newsImage1Ref = useRef<HTMLImageElement>(null);
  const newsImage2Ref = useRef<HTMLImageElement>(null);
  const newsImage3Ref = useRef<HTMLImageElement>(null);
  const contestCoinImage1Ref = useRef<HTMLImageElement>(null);
  const contestCoinImage2Ref = useRef<HTMLImageElement>(null);
  const contestCoinImage3Ref = useRef<HTMLImageElement>(null);
  const reviewImage1Ref = useRef<HTMLDivElement>(null);
  const reviewImage2Ref = useRef<HTMLDivElement>(null);
  const reviewImage3Ref = useRef<HTMLDivElement>(null);
  const reviewImage4Ref = useRef<HTMLDivElement>(null);
  const reviewImage5Ref = useRef<HTMLDivElement>(null);

  // 연락처 포맷팅 함수 (010-XXXX-XXXX)
  const formatPhoneNumber = (value: string) => {
    // 숫자만 추출
    const numbers = value.replace(/[^\d]/g, "");

    // 길이에 따라 포맷팅
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(
        7,
        11
      )}`;
    }
  };

  // 연락처 입력 핸들러
  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, contact: formatted });
  };

  // 폼 유효성 검사
  const isFormValid =
    formData.name.trim() !== "" &&
    formData.contact.replace(/[^\d]/g, "").length >= 10 &&
    privacyAgreed;

  const handleCloseModal = () => {
    // 배경 클릭 시 그냥 닫기만
    setShowModal(false);
  };

  const handleCloseButtonClick = () => {
    // X 버튼 클릭 시 "다시 신청" 팝업 표시
    setShowModal(false);
    setShowSuccessModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!privacyAgreed) {
      alert("개인정보 처리방침에 동의해주세요.");
      return;
    }

    if (!formData.name || !formData.contact) {
      alert("이름과 연락처를 입력해주세요.");
      return;
    }

    // 연락처 유효성 검사 (최소 10자리 숫자)
    const phoneNumbers = formData.contact.replace(/[^\d]/g, "");
    if (phoneNumbers.length < 10) {
      alert("올바른 연락처를 입력해주세요. (010-XXXX-XXXX)");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          contact: formData.contact,
          privacyAgreed: privacyAgreed,
          clickSource: clickSource || "unknown",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "제출에 실패했습니다.");
      }

      // 성공 시 모달 닫고 신청 완료 팝업 표시
      setShowModal(false);
      setShowCompletedModal(true);

      // 폼 초기화
      setFormData({ name: "", contact: "" });
      setPrivacyAgreed(false);
      setClickSource(""); // 추적 정보 초기화
    } catch (error) {
      console.error("Submit error:", error);
      alert(
        error instanceof Error ? error.message : "제출 중 오류가 발생했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToFooter = () => {
    if (footerRef.current) {
      const footerTop = footerRef.current.offsetTop;
      const startPosition = window.pageYOffset;
      const distance = footerTop - startPosition;
      const duration = 500; // 빠른 스크롤 (500ms)
      let start: number | null = null;

      const step = (timestamp: number) => {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        const progressRatio = Math.min(progress / duration, 1);
        const ease = progressRatio * (2 - progressRatio); // ease-out

        window.scrollTo(0, startPosition + distance * ease);

        if (progress < duration) {
          requestAnimationFrame(step);
        }
      };

      requestAnimationFrame(step);
    }
  };

  // Check.gif 이미지 미리 로드 (신청 완료 모달이 즉시 표시되도록)
  useEffect(() => {
    if (typeof window !== "undefined") {
      // link 태그로 프리로드
      const link = document.createElement("link");
      link.rel = "preload";
      link.href = "/check.gif";
      link.as = "image";
      document.head.appendChild(link);

      // Image 객체로도 미리 로드 (이중 보장)
      const img = document.createElement("img");
      img.src = "/check.gif";
    }
  }, []);

  // 메인 이미지와 코인 이미지 미리 로드
  useEffect(() => {
    if (typeof window !== "undefined") {
      // 메인 이미지 preload
      const mainLink = document.createElement("link");
      mainLink.rel = "preload";
      mainLink.href = "/main.gif";
      mainLink.as = "image";
      document.head.appendChild(mainLink);

      // 코인 이미지들 preload
      const leftCoinLink = document.createElement("link");
      leftCoinLink.rel = "preload";
      leftCoinLink.href = "/left_coin.png";
      leftCoinLink.as = "image";
      document.head.appendChild(leftCoinLink);

      const rightCoinLink = document.createElement("link");
      rightCoinLink.rel = "preload";
      rightCoinLink.href = "/right_coin.png";
      rightCoinLink.as = "image";
      document.head.appendChild(rightCoinLink);

      // 메인 이미지 로드 완료 감지
      const mainImg = document.createElement("img");
      mainImg.onload = () => {
        setMainImageLoaded(true);
      };
      mainImg.src = "/main.gif";
    }
  }, []);

  const formatClickSource = (
    utmSource: string,
    materialId: string | null
  ): string => {
    const sourceMap: { [key: string]: string } = {
      daangn: "당근",
      insta: "인스타",
      facebook: "페이스북",
      google: "구글",
      youtube: "유튜브",
      kakao: "카카오",
      naver: "네이버",
    };

    const shortSource = sourceMap[utmSource] || utmSource;
    const homepageName = "소상공인_이자";

    if (materialId) {
      return `${homepageName}_${shortSource}_소재_${materialId}`;
    }
    return `${homepageName}_${shortSource}`;
  };


  // URL 파라미터에서 utm_source 읽어서 clickSource 설정
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const utmSource = params.get("utm_source");
      const materialId = params.get("material_id");

      if (utmSource) {
        setClickSource(formatClickSource(utmSource, materialId));
      }
    }
  }, []);

  // 모달 열기 핸들러 (URL 파라미터가 있으면 우선시)
  const handleOpenModal = (
    defaultSource: string,
    trackSource: boolean = true
  ) => {
    if (trackSource) {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const utmSource = params.get("utm_source");
        const materialId = params.get("material_id");

        if (utmSource) {
          setClickSource(formatClickSource(utmSource, materialId));
        } else {
          setClickSource(defaultSource);
        }
      } else {
        setClickSource(defaultSource);
      }
    } else {
      // 추적하지 않는 경우 (헤더 클릭 등)
      setClickSource("");
    }
    setShowModal(true);
  };

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (footerRef.current) {
            const footerTop = footerRef.current.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;

            // footer가 화면에 보이기 시작하면 숨기기
            if (footerTop <= windowHeight - 100) {
              setShowFloatingBanner(false);
            } else {
              setShowFloatingBanner(true);
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    handleScroll(); // 초기 체크

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  // 섹션 애니메이션을 위한 Intersection Observer
  useEffect(() => {
    const observerOptions = {
      threshold: 0.05,
      rootMargin: "0px 0px -150px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("fadeInUp");
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const sections = [
      contentsSectionRef.current,
      contentsIconsWrapperRef.current,
      newSectionRef.current,
      contentsTextRef.current,
      contentsButtonRef.current,
    ].filter(Boolean);

    sections.forEach((section) => {
      if (section) {
        observer.observe(section);
      }
    });

    return () => {
      sections.forEach((section) => {
        if (section) {
          observer.unobserve(section);
        }
      });
    };
  }, []);

  // 이미지 개별 애니메이션을 위한 Intersection Observer
  useEffect(() => {
    const imageObserverOptions = {
      threshold: 0.05,
      rootMargin: "0px 0px -150px 0px",
    };

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("fadeInUp");
          imageObserver.unobserve(entry.target);
        }
      });
    }, imageObserverOptions);

    // 약간의 지연 후 observer 시작 (컴포넌트가 완전히 렌더링된 후)
    const timer = setTimeout(() => {
      const images = [
        contentsImage1Ref.current,
        contentsImage2Ref.current,
        contentsImage3Ref.current,
        newsImage1Ref.current,
        newsImage2Ref.current,
        newsImage3Ref.current,
        contestCoinImage1Ref.current,
        contestCoinImage2Ref.current,
        contestCoinImage3Ref.current,
      ].filter(Boolean);

      images.forEach((image) => {
        if (image) {
          imageObserver.observe(image);
        }
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      const images = [
        contentsImage1Ref.current,
        contentsImage2Ref.current,
        contentsImage3Ref.current,
      ].filter(Boolean);
      images.forEach((image) => {
        if (image) {
          imageObserver.unobserve(image);
        }
      });
    };
  }, []);

  return (
    <div className={styles.layout_wrapper}>
      <div className={styles.header_gnb}>
        <div className={styles.header_wrapper}>
          <a
            href="https://xn--ok0bx6qu3cv5m.com/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "inline-block" }}
          >
            <img
              src="/baro_logo.png"
              alt="logo"
              className={styles.baro_logo}
              draggable="false"
            />
          </a>
          <button
            className={styles.hamburger_button}
            aria-label={showMenu ? "닫기" : "메뉴"}
            onClick={() => setShowMenu(!showMenu)}
          >
            {showMenu ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="36"
                height="36"
                viewBox="0 0 36 36"
                fill="none"
              >
                <path
                  d="M18 16.5L27 7.5L28.5 9L19.5 18L28.5 27L27 28.5L18 19.5L9 28.5L7.5 27L16.5 18L7.5 9L9 7.5L18 16.5Z"
                  fill="black"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="30"
                height="30"
                viewBox="0 0 30 30"
                fill="none"
              >
                <path
                  d="M23.75 20C24.4404 20 25 20.5596 25 21.25C25 21.9404 24.4404 22.5 23.75 22.5H6.25C5.55964 22.5 5 21.9404 5 21.25C5 20.5596 5.55964 20 6.25 20H23.75ZM23.75 13.75C24.4404 13.75 25 14.3096 25 15C25 15.6904 24.4404 16.25 23.75 16.25H6.25C5.55964 16.25 5 15.6904 5 15C5 14.3096 5.55964 13.75 6.25 13.75H23.75ZM23.75 7.5C24.4404 7.5 25 8.05964 25 8.75C25 9.44036 24.4404 10 23.75 10H6.25C5.55964 10 5 9.44036 5 8.75C5 8.05964 5.55964 7.5 6.25 7.5H23.75Z"
                  fill="black"
                />
              </svg>
            )}
          </button>
        </div>
        {showMenu && (
          <div className={styles.menu}>
            <a
              href="https://xn--ok0bx6qu3cv5m.com/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.menu_item}
              onClick={() => {}}
            >
              한평생바로기업
            </a>
            <a
              href="https://xn--ok0bx6qu3cv5m.com/policyfunds"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.menu_item}
              onClick={() => {}}
            >
              정책자금
            </a>
          </div>
        )}
      </div>
      <div ref={contentRef} className={styles.content}>
        <Image
          src="/main.gif"
          alt="main animation"
          width={467}
          height={467}
          className={styles.main_gif}
          unoptimized={true}
          priority
          onLoad={() => setMainImageLoaded(true)}
        />
        {mainImageLoaded && (
          <>
            <img
              src="/left_coin.png"
              alt="left coin"
              className={styles.left_coin}
            />
            <img
              src="/right_coin.png"
              alt="right coin"
              className={styles.right_coin}
            />
          </>
        )}
      </div>
      <div ref={contentsSectionRef} className={styles.cotent_new_section}>
        <div className={styles.news_text_wrapper}>
          <p className={styles.news_pretext}>2026년 중소벤처기업부 소상공인 예산</p>
          <p className={styles.news_title}>
            소상공인 예산 <span className={styles.news_highlight}>“5.4조”</span>
          </p>
          <div className={styles.news_badge}>
            <p className={styles.news_badge_text}>역대 최대규모</p>
          </div>
        </div>
        <div className={styles.news_images_wrapper}>
          <img
            src="/news_001.png"
            alt="news 001"
            className={styles.news_image}
            ref={newsImage1Ref}
          />
          <img
            src="/news_002.png"
            alt="news 002"
            className={styles.news_image}
            ref={newsImage2Ref}
          />
          <img
            src="/news_003.png"
            alt="news 003"
            className={styles.news_image}
            ref={newsImage3Ref}
          />
        </div>
  
        <p className={styles.news_question}>알고 계셨나요?</p>
      </div>
      <div className={styles.contest_coin_wrapper}>
        <div className={styles.contest_text_wrapper}>
          <div className={styles.contest_notice_icon} />
          <p className={styles.contest_notice_subtitle}>아래 중 하나라도 해당되시는 분들은</p>
          <p className={styles.contest_notice_title}>모르면 손해입니다</p>
        </div>
        <div className={styles.contest_coin_images_wrapper}>
          <img
            src="/coin_001.png"
            alt="coin notice 1"
            className={styles.contest_coin_image}
            ref={contestCoinImage1Ref}
          />
          <img
            src="/coin_002.png"
            alt="coin notice 2"
            className={styles.contest_coin_image}
            ref={contestCoinImage2Ref}
          />
          <img
            src="/coin_003.png"
            alt="coin notice 3"
            className={styles.contest_coin_image}
            ref={contestCoinImage3Ref}
          />
        </div>
        <div className={styles.news_divider}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="4"
            height="28"
            viewBox="0 0 4 28"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="2" cy="2" r="2" fill="white" />
            <circle cx="2" cy="14" r="2" fill="white" />
            <circle cx="2" cy="26" r="2" fill="white" />
          </svg>
        </div>
        <p className={styles.contest_interest_text}>
          이 상태로 1년만 가도,<br/> <span className={styles.contest_interest_highlight}>수백만원의 이자</span>를 더 내시게됩니다.
        </p>
      </div>
      
      <div ref={contentsSectionRef} className={styles.contents_section}>
        <img
          src="/contents_001.png"
          alt="contents"
          className={styles.contents_image}
        />
      </div>
      
    
      <div
        ref={contentsIconsWrapperRef}
        className={styles.contents_icons_wrapper}
      >
       <img src="/contents_002.png" alt="contents" className={styles.contents_image} />
      </div>
      <Calculator />
      <div ref={newSectionRef} className={styles.new_section}>
        <div className={styles.star_image}></div>
        <p className={styles.review_text}>
          한평생 바로기업은 결과로 보여드립니다.
        </p>
        <h2 className={styles.review_title}>실제 대표님들의 후기</h2>
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={20}
          slidesPerView={1.2}
          centeredSlides={true}
          navigation
          pagination={{ clickable: true }}
          className={styles.reviews_scroll}
          breakpoints={{
            375: {
              slidesPerView: "auto",
              spaceBetween: 0,
              centeredSlides: true,
            },
            480: {
              slidesPerView: "auto",
              spaceBetween: 10,
              centeredSlides: true,
            },
            768: {
              slidesPerView: "auto",
              spaceBetween: 16,
              centeredSlides: false,
            },
            1024: {
              slidesPerView: "auto",
              spaceBetween: 20,
              centeredSlides: false,
            },
            1280: {
              slidesPerView: "auto",
              spaceBetween: 24,
              centeredSlides: false,
            },
            1920: {
              slidesPerView: "auto",
              spaceBetween: 70,
              centeredSlides: false,
            },
          }}
        >
          <SwiperSlide>
            <div ref={reviewImage1Ref} className={styles.review_container}>
              <img
                src="/review_01.png"
                alt="review 01"
                className={styles.review_item}
              />
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div ref={reviewImage2Ref} className={styles.review_container}>
              <img
                src="/review_02.png"
                alt="review 02"
                className={styles.review_item}
              />
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div ref={reviewImage3Ref} className={styles.review_container}>
              <img
                src="/review_03.png"
                alt="review 03"
                className={styles.review_item}
              />
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div ref={reviewImage4Ref} className={styles.review_container}>
              <img
                src="/review_04.png"
                alt="review 04"
                className={styles.review_item}
              />
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div ref={reviewImage5Ref} className={styles.review_container}>
              <img
                src="/review_05.png"
                alt="review 05"
                className={styles.review_item}
              />
            </div>
          </SwiperSlide>
        </Swiper>
      </div>

      <footer ref={footerRef} className={styles.footer}>
        <div className={styles.footer_text_wrapper}>
          <p className={styles.footer_text_small}>지금 대출 상태만 간단히 점검받으세요</p>
          <p className={styles.footer_text_main}>
            1분만 투자<span className={styles.footer_text_sub}>하시면</span>,<br /><span className={styles.footer_text_sub}>지금부터</span> 절약할 수 있습니다
          </p>
        
        </div>
        <button
          className={styles.footer_button}
          onClick={() => handleOpenModal("소상공인_이자")}
        >
          지금 대출상태 무료점검 받기
        </button>
      </footer>
      {showFloatingBanner && (
        <div className={styles.floating_banner}>
          <button onClick={scrollToFooter} className={styles.floating_button}>
          지금 대출상태 무료점검 받기
          </button>
        </div>
      )}
      {showModal && (
        <div className={styles.modal_overlay} onClick={handleCloseModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.modal_close}
              onClick={handleCloseButtonClick}
              aria-label="닫기"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
              >
                <rect
                  width="20"
                  height="20"
                  rx="10"
                  fill="black"
                  fillOpacity="0.3"
                />
                <path
                  d="M10 10.7985L7.20532 13.5932C7.10076 13.6977 6.96768 13.75 6.80608 13.75C6.64449 13.75 6.51141 13.6977 6.40684 13.5932C6.30228 13.4886 6.25 13.3555 6.25 13.1939C6.25 13.0323 6.30228 12.8992 6.40684 12.7947L9.20152 10L6.40684 7.20532C6.30228 7.10076 6.25 6.96768 6.25 6.80608C6.25 6.64449 6.30228 6.51141 6.40684 6.40684C6.51141 6.30228 6.64449 6.25 6.80608 6.25C6.96768 6.25 7.10076 6.30228 7.20532 6.40684L10 9.20152L12.7947 6.40684C12.8992 6.30228 13.0323 6.25 13.1939 6.25C13.3555 6.25 13.4886 6.30228 13.5932 6.40684C13.6977 6.51141 13.75 6.64449 13.75 6.80608C13.75 6.96768 13.6977 7.10076 13.5932 7.20532L10.7985 10L13.5932 12.7947C13.6977 12.8992 13.75 13.0323 13.75 13.1939C13.75 13.3555 13.6977 13.4886 13.5932 13.5932C13.4886 13.6977 13.3555 13.75 13.1939 13.75C13.0323 13.75 12.8992 13.6977 12.7947 13.5932L10 10.7985Z"
                  fill="white"
                />
              </svg>
            </button>
            <div className={styles.modal_inner}>
              <p className={styles.modal_top_text}>지금 바로 시작하세요</p>
            </div>
            <h2 className={styles.modal_title}>정책자금 무료상담 신청</h2>
            <form className={styles.modal_form} onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="이름 혹은 회사명"
                className={styles.modal_input}
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
              <input
                type="tel"
                placeholder="개인 연락처 혹은 회사 연락처"
                className={styles.modal_input}
                value={formData.contact}
                onChange={handleContactChange}
                maxLength={13}
                required
              />
            </form>
            <div className={styles.modal_privacy}>
              <span className={styles.modal_privacy_text}>
                개인정보 처리방침 동의
              </span>
              <button
                className={styles.modal_checkbox}
                onClick={() => setPrivacyAgreed(!privacyAgreed)}
                aria-label="개인정보 처리방침 동의"
                aria-checked={privacyAgreed}
              >
                {privacyAgreed && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M14.364 3.40735C14.5515 3.59487 14.6568 3.84918 14.6568 4.11435C14.6568 4.37951 14.5515 4.63382 14.364 4.82135L6.86867 12.3167C6.76962 12.4158 6.65202 12.4943 6.52259 12.548C6.39316 12.6016 6.25443 12.6292 6.11433 12.6292C5.97424 12.6292 5.83551 12.6016 5.70608 12.548C5.57665 12.4943 5.45905 12.4158 5.36 12.3167L1.636 8.59335C1.54049 8.5011 1.46431 8.39076 1.4119 8.26875C1.35949 8.14675 1.3319 8.01553 1.33075 7.88275C1.3296 7.74997 1.3549 7.61829 1.40518 7.49539C1.45546 7.3725 1.52971 7.26085 1.6236 7.16695C1.7175 7.07306 1.82915 6.99881 1.95205 6.94853C2.07494 6.89825 2.20662 6.87294 2.3394 6.8741C2.47218 6.87525 2.6034 6.90284 2.7254 6.95525C2.84741 7.00766 2.95775 7.08384 3.05 7.17935L6.114 10.2433L12.9493 3.40735C13.0422 3.31442 13.1525 3.2407 13.2738 3.19041C13.3952 3.14011 13.5253 3.11423 13.6567 3.11423C13.788 3.11423 13.9181 3.14011 14.0395 3.19041C14.1609 3.2407 14.2711 3.31442 14.364 3.40735Z"
                      fill="white"
                    />
                  </svg>
                )}
              </button>
            </div>
            <div className={styles.modal_privacy_content}>
              <div className={styles.modal_privacy_scroll}>
                <p className={styles.modal_privacy_item}>
                  <strong>1. 개인정보 수집 및 이용 목적</strong>
                  <br />
                  상담 진행, 정책자금 컨설팅, 문의사항 응대, 민원해결
                  <br />
                  광고성 정보 수신에 대하여 별도의 동의를 한 회원에 한하여
                  "한평생 바로기업"과 각 제휴사의 새로운 서비스, 이벤트, 최신
                  정보의 안내 등 회원의 취향에 맞는 최적의 정보 제공
                </p>
                <p className={styles.modal_privacy_item}>
                  <strong>2. 수집 및 이용하는 개인정보 항목</strong>
                  <br />
                  (필수) 이름(회사명), 휴대전화번호
                  <br />
                  (선택) 제출된 상담 문의 내용 또는 첨부파일에 기재된 개인정보
                </p>
                <p className={styles.modal_privacy_item}>
                  <strong>3. 보유 및 이용 기간</strong>
                  <br />
                  법령이 정하는 경우를 제외하고는 수집일로부터 1년 또는 동의
                  철회 시까지 보유 및 이용합니다.
                </p>
                <p className={styles.modal_privacy_item}>
                  <strong>4. 동의 거부 권리</strong>
                  <br />
                  신청자는 동의를 거부할 권리가 있습니다. 단, 동의를 거부하는
                  경우 상담 서비스 이용이 제한됩니다.
                </p>
              </div>
              
            </div>
            
            <button
              type="submit"
              className={styles.modal_submit_button}
              onClick={handleSubmit}
              disabled={isSubmitting || !isFormValid}
            >
              {isSubmitting ? "제출 중..." : "무료상담 신청하기"}
            </button>
          </div>
        </div>
      )}
      {showCompletedModal && (
        <div
          className={styles.modal_overlay}
          onClick={() => setShowCompletedModal(false)}
        >
          <div
            className={styles.completed_modal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.completed_modal_content}>
              <img
                src="/check.gif"
                alt="신청 완료"
                className={styles.completed_modal_image}
                loading="eager"
                decoding="async"
              />
              <h2 className={styles.completed_modal_title}>
                신청이 완료되었습니다
              </h2>
              <button
                className={styles.completed_modal_button}
                onClick={() => setShowCompletedModal(false)}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
      {showSuccessModal && (
        <div
          className={styles.modal_overlay}
          onClick={() => setShowSuccessModal(false)}
        >
          <div
            className={styles.success_modal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.success_modal_image_wrapper}>
              <img
                src="/landing_popup.png"
                alt="정책자금 지원 안내"
                className={styles.success_modal_image}
              />
              <button
                className={styles.success_modal_close}
                onClick={() => setShowSuccessModal(false)}
                aria-label="닫기"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <rect
                    width="20"
                    height="20"
                    rx="10"
                    fill="black"
                    fillOpacity="0.3"
                  />
                  <path
                    d="M10 10.7985L7.20532 13.5932C7.10076 13.6977 6.96768 13.75 6.80608 13.75C6.64449 13.75 6.51141 13.6977 6.40684 13.5932C6.30228 13.4886 6.25 13.3555 6.25 13.1939C6.25 13.0323 6.30228 12.8992 6.40684 12.7947L9.20152 10L6.40684 7.20532C6.30228 7.10076 6.25 6.96768 6.25 6.80608C6.25 6.64449 6.30228 6.51141 6.40684 6.40684C6.51141 6.30228 6.64449 6.25 6.80608 6.25C6.96768 6.25 7.10076 6.30228 7.20532 6.40684L10 9.20152L12.7947 6.40684C12.8992 6.30228 13.0323 6.25 13.1939 6.25C13.3555 6.25 13.4886 6.30228 13.5932 6.40684C13.6977 6.51141 13.75 6.64449 13.75 6.80608C13.75 6.96768 13.6977 7.10076 13.5932 7.20532L10.7985 10L13.5932 12.7947C13.6977 12.8992 13.75 13.0323 13.75 13.1939C13.75 13.3555 13.6977 13.4886 13.5932 13.5932C13.4886 13.6977 13.3555 13.75 13.1939 13.75C13.0323 13.75 12.8992 13.6977 12.7947 13.5932L10 10.7985Z"
                    fill="white"
                  />
                </svg>
              </button>
              <button
                className={styles.success_modal_button}
                onClick={() => {
                  setShowSuccessModal(false);
                  setShowModal(true);
                }}
              >
                이어서 상담신청
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
