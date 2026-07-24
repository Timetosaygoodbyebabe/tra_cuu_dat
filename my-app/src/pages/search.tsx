import React, { useEffect, useState } from "react";
import { Page, Header, Box, Text, useNavigate } from "zmp-ui";
import bg from "@/static/dragon_bg.png";
import dataUrl from "../../public/data.json?url";

const removeAccents = (str: string) => {
  return str.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
};

export default function SearchPage() {
  const queryParams = new URLSearchParams(window.location.search);
  const dvhcParam = queryParams.get('dvhc') || '';
  const streetParam = queryParams.get('street') || '';
  const segmentParam = queryParams.get('segment') || '';
  const cacheKey = `${dvhcParam}_${streetParam}_${segmentParam}`;

  const cachedSearch = (window as any).__searchCache;
  const isCacheValid = cachedSearch?.key === cacheKey;

  const [results, setResults] = useState<any[]>(() => isCacheValid ? cachedSearch.results : []);
  const [loading, setLoading] = useState(() => !isCacheValid);
  const navigate = useNavigate();
  const scrollRestorationRef = React.useRef<HTMLDivElement>(null);

  // Lưu trạng thái mỗi khi results thay đổi để khi back về vẫn giữ nguyên list
  useEffect(() => {
    if (results.length > 0) {
      (window as any).__searchCache = {
        key: cacheKey,
        results: results
      };
    }
  }, [results, cacheKey]);

  useEffect(() => {
    if (isCacheValid && results.length > 0) {
      // Đã có cache thì bỏ qua fetch lại để không bị reset thanh cuộn
      return;
    }

    const fetchResults = async () => {
      try {
        setLoading(true);
        // Lấy query string từ URL (VD: ?dvhc=...&street=...)
        const queryParams = new URLSearchParams(window.location.search);
        const dvhc = queryParams.get('dvhc') || '';
        const street = queryParams.get('street') || '';
        const segment = queryParams.get('segment') || '';

        const response = await fetch(dataUrl);
        const rawRecords = await response.json();

        // Ánh xạ lại các phím ngắn về phím dài ban đầu để phần code React còn lại chạy bình thường
        const records = rawRecords.map((d: any) => ({
          ten_duong: d.td,
          doan_duong: d.dd,
          ten_dvhc: d.hc,
          gia_dat_o_vt1: d.o1,
          gia_dat_o_vt2: d.o2,
          gia_dat_o_vt3: d.o3,
          gia_dat_o_vt4: d.o4,
          gia_dat_o_vt5: d.o5,
          gia_dat_tmdv_vt1: d.tm1,
          gia_dat_tmdv_vt2: d.tm2,
          gia_dat_tmdv_vt3: d.tm3,
          gia_dat_tmdv_vt4: d.tm4,
          gia_dat_tmdv_vt5: d.tm5,
          gia_dat_co_so_san_xuat_phi_nong_nghiep_vt1: d.sx1,
          gia_dat_co_so_san_xuat_phi_nong_nghiep_vt2: d.sx2,
          gia_dat_co_so_san_xuat_phi_nong_nghiep_vt3: d.sx3,
          gia_dat_co_so_san_xuat_phi_nong_nghiep_vt4: d.sx4,
          gia_dat_co_so_san_xuat_phi_nong_nghiep_vt5: d.sx5
        }));

        // Lọc dữ liệu ngay trên RAM của điện thoại (Cực kỳ nhanh)
        const filterDvhc = removeAccents(dvhc.trim().toLowerCase());
        const filterStreet = removeAccents(street.trim().toLowerCase());
        const filterSegment = removeAccents(segment.trim().toLowerCase());

        let filteredRecords = records.filter((item: any) => {
          let match = true;

          if (filterStreet) {
            const itemStreet = removeAccents((item.ten_duong || '').toLowerCase());
            if (!itemStreet.includes(filterStreet)) match = false;
          }

          if (filterSegment) {
            const itemSegment = removeAccents((item.doan_duong || '').toLowerCase());
            if (!itemSegment.includes(filterSegment)) match = false;
          }

          if (filterDvhc) {
            const itemDvhc = removeAccents((item.ten_dvhc || '').toLowerCase());
            if (!itemDvhc.includes(filterDvhc)) match = false;
          }

          return match;
        });

        // Lưu toàn bộ kết quả lọc được (Để dùng cho nút Tải thêm)
        (window as any).fullFilteredRecords = filteredRecords; // Lưu tạm vào global để load more

        // Giới hạn hiển thị ban đầu để UI không bị đơ
        const initialDisplay = filteredRecords.slice(0, (window as any).currentDisplayLimit || 100);

        // Hiển thị ngay kết quả cục bộ
        setResults([...initialDisplay]);
        setLoading(false); // Tắt loading spinner ngay lập tức
        return;
      } catch (error) {
        console.error("Lỗi Fetch Backend:", error);
        // Khi xảy ra lỗi (VD API chết hoặc Backend chưa bật), trả về mảng rỗng thay vì dữ liệu mẫu
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const loadMore = () => {
    const fullRecords = (window as any).fullFilteredRecords;
    if (fullRecords) {
      const currentLen = results.length;
      const nextLimit = currentLen + 100;
      (window as any).currentDisplayLimit = nextLimit;
      setResults([...fullRecords.slice(0, nextLimit)]);
    }
  };

  // Phục hồi thanh cuộn khi render xong từ Cache
  useEffect(() => {
    if (isCacheValid && results.length > 0) {
      setTimeout(() => {
        const scrollY = (window as any).__searchCache_scrollY;
        if (scrollY !== undefined && scrollRestorationRef.current) {
          const scrollTarget = scrollRestorationRef.current.closest('.zmp-page-content') || scrollRestorationRef.current.closest('.zmp-page') || scrollRestorationRef.current.closest('.zmp-search-page') || document.documentElement;
          if (scrollTarget) {
            scrollTarget.scrollTop = scrollY;
          }
        }
      }, 150);
    }
  }, [isCacheValid, results.length]);

  return (
    <Page
      className="relative bg-[#FAFAFA] min-h-screen pb-[100px] z-0 zmp-search-page"
      onScroll={(e) => {
        const target = e.target as HTMLElement;
        (window as any).__searchCache_scrollY = target.scrollTop || 0;
      }}
    >
      <Header title="Kết quả tra cứu" showBackIcon />
      <Box className="px-4 pt-[100px] pb-4 space-y-4 relative z-10">
        <div ref={scrollRestorationRef} />
        {loading ? (
          <Text className="text-center text-gray-500 mt-10">Đang tải dữ liệu...</Text>
        ) : (
          <>
            <Text className="text-base font-semibold text-gray-600 mb-2">
              Tìm thấy {((window as any).fullFilteredRecords?.length || results.length)} kết quả
            </Text>
            {results.map((item, index) => (
              <Box
                key={item.id || index}
                className="bg-white p-4 rounded-xl shadow-sm active:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/detail?id=${item.id}`, { state: { item } })}
              >
                <Text className="font-bold text-lg text-[#1A1A1A] mb-1">{item.ten_duong || item.street}</Text>
                <Text className="text-sm text-gray-500 mb-2">{item.doan_duong || item.segment}</Text>
                <Box className="flex justify-end items-center mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center text-blue-600 font-medium text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>Xem chi tiết</span>
                  </div>
                </Box>
              </Box>
            ))}

            {/* Nút Xem Thêm */}
            {((window as any).fullFilteredRecords?.length || 0) > results.length && (
              <Box className="flex justify-center mt-6 mb-8 pt-4">
                <div
                  onClick={loadMore}
                  className="bg-blue-100 text-blue-700 font-bold px-8 py-3 rounded-full active:bg-blue-200 cursor-pointer text-sm shadow-sm"
                >
                  Xem thêm các đường khác
                </div>
              </Box>
            )}
          </>
        )}
      </Box>

      {/* Background Image */}
      <div
        className="fixed bottom-0 left-0 w-full h-[50vh] bg-no-repeat opacity-60 pointer-events-none z-[-1]"
        style={{
          backgroundImage: `url(${bg})`,
          backgroundSize: "150%",
          backgroundPosition: "right -1px bottom 0px"
        }}
      />
    </Page>
  );
}
