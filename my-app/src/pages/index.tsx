import React, { useState } from "react";
import { Box, Button, Icon, Page, Text, Input, Select, useNavigate } from "zmp-ui";
import bg from "@/static/dragon_bg.png";

const { Option } = Select;

const PHUONG_XA_LIST = [
  "Phường An Hải", "Phường An Khê", "Phường An Thắng", "Xã Avương", "Xã Bà Nà",
  "Phường Bàn Thạch", "Xã Bến Giằng", "Xã Bến Hiên", "Phường Cẩm Lệ", "Xã Chiên Đàn",
  "Xã Duy Nghĩa", "Xã Duy Xuyên", "Xã Đại Lộc", "Xã Đắc Pring", "Phường Điện Bàn Bắc",
  "Phường Điện Bàn Đông", "Phường Điện Bàn Tây", "Phường Điện Bàn", "Xã Đồng Dương",
  "Xã Đông Giang", "Xã Đức Phú", "Xã Gò Nổi", "Xã Hà Nha", "Phường Hải Châu",
  "Phường Hải Vân", "Xã Hiệp Đức", "Phường Hòa Cường", "Phường Hòa Khánh", "Xã Hòa Tiến",
  "Xã Hòa Vang", "Phường Hòa Xuân", "Xã Hoàng Sa", "Phường Hội An Đông",
  "Phường Hội An Tây", "Phường Hội An", "Xã Hùng Sơn", "Phường Hương Trà", "Xã Khâm Đức",
  "Xã La Dêê", "Xã La Êê", "Xã Lãnh Ngọc", "Phường Liên Chiểu", "Xã Nam Giang",
  "Xã Nam Phước", "Xã Nam Trà My", "Phường Ngũ Hành Sơn", "Xã Nông Sơn", "Xã Núi Thành",
  "Xã Phú Ninh", "Xã Phú Thuận", "Xã Phước Chánh", "Xã Phước Công", "Xã Phước Kim",
  "Xã Phước Lộc", "Xã Phước Hiệp", "Xã Phước Năng", "Xã Phước Thành", "Xã Phước Trà",
  "Phường Quảng Phú", "Xã Quế Phước", "Xã Quế Sơn Trung", "Xã Quế Sơn", "Xã Sông Kôn",
  "Xã Sông Vàng", "Xã Sơn Cẩm Hà", "Phường Sơn Trà", "Xã Tam Anh", "Xã Tam Hải",
  "Phường Tam Kỳ", "Xã Tam Mỹ", "Xã Tam Xuân", "Xã Tân Hiệp", "Xã Tây Giang",
  "Xã Tây Hồ", "Xã Thạnh Bình", "Phường Thanh Khê", "Xã Thạnh Mỹ", "Xã Thăng An",
  "Xã Thăng Bình", "Xã Thăng Điền", "Xã Thăng Phú", "Xã Thăng Trường", "Xã Thu Bồn",
  "Xã Thượng Đức", "Xã Tiên Phước", "Xã Trà Đốc", "Xã Trà Giáp", "Xã Trà Leng",
  "Xã Trà Liên", "Xã Trà Linh", "Xã Trà My", "Xã Trà Tân", "Xã Trà Tập",
  "Xã Trà Vân", "Xã Việt An", "Xã Vu Gia", "Xã Xuân Phú"
];

const removeAccents = (str: string) => {
  return str.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

function HomePage() {
  const [dvhc, setDvhc] = useState("");
  const [street, setStreet] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const normalizedDvhc = removeAccents(dvhc.toLowerCase());
  const filteredPhuongXa = PHUONG_XA_LIST.filter(p =>
    removeAccents(p.toLowerCase()).includes(normalizedDvhc)
  );

  React.useEffect(() => {
    // Xoá cache tìm kiếm khi quay lại trang chủ
    delete (window as any).__searchCache;
    delete (window as any).fullFilteredRecords;
    (window as any).currentDisplayLimit = 100;
  }, []);

  const handleSearch = () => {

    const searchParams = new URLSearchParams();
    if (dvhc) searchParams.append("dvhc", dvhc);
    if (street) searchParams.append("street", street);

    navigate(`/search?${searchParams.toString()}`);
  };

  return (
    <Page className="relative bg-white min-h-screen pb-[100px] z-0">
      <Box className="px-5 pt-[120px]">
        <Text.Title className="text-4xl font-medium mb-16 text-[#1A1A1A] tracking-tight">Tra cứu giá đất trên địa bàn thành phố Đà Nẵng</Text.Title>

        <Box className="space-y-6 relative z-50">
          {/* Tên Đơn Vị Hành Chính */}
          <div className="bg-white rounded-3xl shadow-md px-4 py-2 relative">
            <div className="text-sm text-gray-900 font-semibold tracking-widest mb-1 uppercase">Tên Phường Xã</div>
            <div className="flex items-center">
              <Input
                placeholder="Nhập tên phường xã..."
                value={dvhc}
                onChange={(e) => setDvhc(e.target.value)}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                clearable
                className="w-full !p-0 !border-none !shadow-none !bg-transparent !text-[#1A1A1A] text-lg font-medium outline-none placeholder-gray-300"
              />
              <div
                className="cursor-pointer ml-2"
                onMouseDown={(e) => {
                  e.preventDefault(); // Ngăn không cho Input bị mất focus (tránh trigger onBlur)
                  setShowDropdown(!showDropdown);
                }}
              >
                <Icon
                  icon={showDropdown ? "zi-chevron-up" : "zi-chevron-down"}
                  className="text-gray-400"
                />
              </div>
            </div>
            {showDropdown && filteredPhuongXa.length > 0 && (
              <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-lg border border-gray-100 max-h-60 overflow-y-auto z-50 py-2">
                {filteredPhuongXa.map((p, idx) => (
                  <div
                    key={idx}
                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-[#1A1A1A] font-medium transition-colors"
                    onClick={() => {
                      setDvhc(p);
                      setShowDropdown(false);
                    }}
                  >
                    {p}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tên Đường */}
          <div className="bg-white rounded-3xl shadow-md px-4 py-2 relative">
            <div className="text-sm text-gray-900 font-semibold tracking-widest mb-1 uppercase">Tên Đường</div>
            <Input
              placeholder="Nhập tên đường..."
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              clearable
              className="w-full !p-0 !border-none !shadow-none !bg-transparent !text-[#1A1A1A] text-lg font-medium outline-none placeholder-gray-300"
            />
          </div>
        </Box>

        <Box className="mt-12 flex justify-center relative z-10">
          <Button
            onClick={handleSearch}
            disabled={!street.trim()}
            className="w-[200px] h-[48px] rounded-full font-semibold text-lg shadow-md flex items-center justify-center gap-2"
            style={{ backgroundColor: street.trim() ? "#0068FF" : "#e5e7eb", border: "none", color: street.trim() ? "#fff" : "#9ca3af" }}
          >
            <Icon icon="zi-search" className={street.trim() ? "text-white" : "text-gray-400"} />
            <span>Tra cứu</span>
          </Button>
        </Box>
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

export default HomePage;
