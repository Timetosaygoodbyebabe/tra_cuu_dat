import React, { useEffect, useState, useCallback } from "react";
import { Page, Header, Box, Text, useNavigate } from "zmp-ui";
import bg from "@/static/dragon_bg.png";

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
        results: results,
        totalRecords: (window as any).totalRecords
      };
    }
  }, [results, cacheKey]);

  const fetchResults = useCallback(async (isLoadMore = false) => {
    try {
      if (!isLoadMore) setLoading(true);
      const queryParams = new URLSearchParams(window.location.search);
      const dvhc = queryParams.get('dvhc') || '';
      const street = queryParams.get('street') || '';
      const segment = queryParams.get('segment') || '';
      const offset = isLoadMore ? results.length : 0;
      const limit = 100;

      const url = `https://tracuugiadat.1022.vn/api/land-prices?dvhc=${encodeURIComponent(dvhc)}&street=${encodeURIComponent(street)}&segment=${encodeURIComponent(segment)}&limit=${limit}&offset=${offset}`;
      const response = await fetch(url);
      const json = await response.json();

      let responseData = json.data || [];

      if (isLoadMore) {
        setResults(prev => [...prev, ...responseData]);
      } else {
        setResults(responseData);
        (window as any).totalRecords = responseData.length < (json.total || 0) ? json.total : responseData.length;
      }
    } catch (error) {
      console.error("Lỗi Fetch Backend:", error);
      if (!isLoadMore) setResults([]);
    } finally {
      setLoading(false);
    }
  }, [results.length]);

  useEffect(() => {
    if (isCacheValid && results.length > 0) {
      // Đã có cache thì bỏ qua fetch lại để không bị reset thanh cuộn
      return;
    }
    fetchResults(false);
  }, [isCacheValid, fetchResults]);

  const loadMore = () => {
    fetchResults(true);
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
              Tìm thấy {((window as any).totalRecords || results.length)} kết quả
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
            {((window as any).totalRecords || 0) > results.length && (
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
