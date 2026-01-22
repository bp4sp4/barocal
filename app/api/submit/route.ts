import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendConsultationEmail } from "@/lib/email";

// Node.js 런타임을 명시적으로 설정
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Vercel Serverless 함수 타임아웃 설정 (초 단위)
// Pro 플랜: 최대 300초, Hobby 플랜: 최대 10초
// 이메일 전송 재시도 고려하여 90초로 설정
export const maxDuration = 90;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

// 환경 변수가 없을 때를 대비한 클라이언트 생성
const getSupabaseClient = () => {
  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

export async function POST(request: NextRequest) {
  // 함수 시작 로그 (배포 환경에서도 확인 가능하도록)
  console.log("=== POST /api/submit called ===");
  console.log("Timestamp:", new Date().toISOString());
  console.log("Environment:", process.env.NODE_ENV);

  try {
    const body = await request.json();
    const { name, contact, privacyAgreed, clickSource, industry, revenue, debt } = body;

    console.log("Request body received:", {
      name,
      contact,
      privacyAgreed,
      clickSource,
      industry,
      revenue,
      debt,
    });

    // 필수 필드 검증
    if (!name || !contact) {
      return NextResponse.json(
        { error: "이름과 연락처를 입력해주세요." },
        { status: 400 }
      );
    }

    if (!privacyAgreed) {
      return NextResponse.json(
        { error: "개인정보 처리방침에 동의해주세요." },
        { status: 400 }
      );
    }

    // Supabase 클라이언트 가져오기
    console.log("Getting Supabase client...");
    console.log(
      "Supabase URL configured:",
      !!process.env.NEXT_PUBLIC_SUPABASE_URL
    );
    console.log(
      "Supabase Service Key configured:",
      !!process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const supabase = getSupabaseClient();

    if (!supabase) {
      console.error("Supabase client is null - configuration missing");
      return NextResponse.json(
        { error: "데이터베이스 연결 설정이 필요합니다." },
        { status: 500 }
      );
    }

    console.log("Supabase client created successfully");

    // Supabase에 데이터 저장
    console.log("Inserting data into Supabase...");
    const { data, error } = await supabase
      .from("consultations")
      .insert([
        {
          name,
          contact,
          is_completed: false, // 신청 시에는 미완료 상태
          click_source: clickSource || "unknown", // 클릭 출처 추적
          industry: industry || null, // 업종
          revenue: revenue || null, // 연간 매출액
          debt: debt || null, // 현재 부채
        },
      ])
      .select();

    if (error) {
      console.error("Supabase error:", error);
      console.error("Supabase error details:", JSON.stringify(error, null, 2));
      return NextResponse.json(
        {
          error: "데이터 저장 중 오류가 발생했습니다.",
          details: error.message,
        },
        { status: 500 }
      );
    }

    console.log("Data inserted successfully:", data);

    // 이메일 알림 전송 (비동기, 실패해도 상담 신청은 성공 처리)
    console.log("[EMAIL] 이메일 전송 시도 시작");
    console.log("[EMAIL] 환경 변수 확인:");
    console.log(
      "[EMAIL] - BREVO_SMTP_LOGIN 존재:",
      !!process.env.BREVO_SMTP_LOGIN
    );
    console.log(
      "[EMAIL] - BREVO_SMTP_LOGIN 값:",
      process.env.BREVO_SMTP_LOGIN
        ? `${process.env.BREVO_SMTP_LOGIN.substring(0, 3)}***`
        : "없음"
    );
    console.log("[EMAIL] - BREVO_SMTP_KEY 존재:", !!process.env.BREVO_SMTP_KEY);
    console.log(
      "[EMAIL] - BREVO_SMTP_KEY 길이:",
      process.env.BREVO_SMTP_KEY ? process.env.BREVO_SMTP_KEY.length : 0
    );
    console.log(
      "[EMAIL] - CONSULTATION_EMAIL:",
      process.env.CONSULTATION_EMAIL || "없음"
    );
    console.log(
      "[EMAIL] - BREVO_FROM_EMAIL:",
      process.env.BREVO_FROM_EMAIL || "없음"
    );
    console.log(
      "[EMAIL] - BREVO_FROM_NAME:",
      process.env.BREVO_FROM_NAME || "없음"
    );

    // Brevo 환경 변수 확인
    if (process.env.BREVO_SMTP_LOGIN && process.env.BREVO_SMTP_KEY) {
      console.log("[EMAIL] 이메일 전송 함수 호출");
      // await로 기다려서 Serverless 함수가 종료되기 전에 이메일 전송 완료
      try {
        const emailResult = await sendConsultationEmail({
          name,
          contact,
          click_source: clickSource || null,
          industry: industry || null,
          revenue: revenue || null,
          debt: debt || null,
        });
        console.log(
          "[EMAIL] 이메일 전송 결과:",
          JSON.stringify(emailResult, null, 2)
        );
      } catch (emailError: unknown) {
        // 이메일 전송 실패해도 상담 신청은 성공 처리
        console.error("[EMAIL] 이메일 전송 실패:");
        console.error(
          "[EMAIL] 에러 타입:",
          emailError instanceof Error
            ? emailError.constructor.name
            : typeof emailError
        );
        console.error(
          "[EMAIL] 에러 메시지:",
          emailError instanceof Error ? emailError.message : String(emailError)
        );
        console.error(
          "[EMAIL] 에러 스택:",
          emailError instanceof Error ? emailError.stack : "스택 없음"
        );
        console.error(
          "[EMAIL] 전체 에러 객체:",
          JSON.stringify(emailError, Object.getOwnPropertyNames(emailError), 2)
        );
      }
    } else {
      console.warn(
        "[EMAIL] Brevo 환경 변수가 설정되지 않아 이메일 전송을 건너뜁니다"
      );
      console.warn(
        "[EMAIL] 필요한 환경 변수: BREVO_SMTP_LOGIN, BREVO_SMTP_KEY"
      );
    }

    console.log("=== Request processed successfully ===");
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error("=== API ERROR ===");
    console.error(
      "Error type:",
      error instanceof Error ? error.constructor.name : typeof error
    );
    console.error(
      "Error message:",
      error instanceof Error ? error.message : String(error)
    );
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : undefined
    );
    console.error(
      "Full error:",
      JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
    );

    return NextResponse.json(
      {
        error: "서버 오류가 발생했습니다.",
        message: error instanceof Error ? error.message : String(error),
        type: error instanceof Error ? error.constructor.name : typeof error,
      },
      { status: 500 }
    );
  }
}
