using System.Text.Json;
using System.Text.RegularExpressions;
using LandPriceApi.Models;

namespace LandPriceApi.Services;

public class LandPriceStore
{
    private readonly ILogger<LandPriceStore> _logger;
    private readonly string _dataFileDir;
    private readonly string _dataFilePath;
    private readonly string _wardCachePath;
    private List<LandPriceItem> _items = new();
    private Dictionary<string, string> _wardCache = new(StringComparer.OrdinalIgnoreCase);
    private readonly ReaderWriterLockSlim _lock = new();

    private static readonly (string NewWard, string[] Keywords)[] WardMapping =
    [
        ("Phường Hải Châu", ["thanh bình", "thuận phước", "thạch thang", "phước ninh", "hải châu", "bình hiên", "nam dương", "đảo xanh", "đầm rong", "xuân đán", "bạch đằng", "lê duẩn", "đống đa", "quang trung", "trần phú", "3 tháng 2", "ba đình", "hải phòng"]),
        ("Phường Hòa Cường", ["bình thuận", "hòa thuận", "hòa cường", "tiên sơn", "hóa sơn", "hưng hóa", "nại nam", "quy mỹ", "xuân hòa", "2 tháng 9", "30 tháng 4", "núi thành", "duy tân", "bình minh", "bình an", "tiểu la", "xô viết nghệ tĩnh"]),
        ("Phường Thanh Khê", ["xuân hà", "chính gián", "thạc gián", "thanh khê", "thanh huy", "yên khê", "tân lập", "tân hòa", "đầm sen", "điện biên phủ", "trần cao vân", "nguyễn tất thành", "hàm nghi", "lê độ", "cù chính lan", "an xuân"]),
        ("Phường An Khê", ["hòa an", "hòa phát", "an khê", "phước lý", "phần lăng", "bàu hạc", "phước tường", "trung lập", "bế văn đàn", "trường chinh", "tôn đản", "hà huy tập"]),
        ("Phường An Hải", ["phước mỹ", "an hải", "an cư", "an đồn", "an trung", "an bắc", "an nhơn", "phước trường", "an mỹ", "an vĩnh", "phạm văn đồng", "võ nguyên giáp", "nguyễn văn thoại", "hồ nghinh"]),
        ("Phường Sơn Trà", ["thọ quang", "nại hiên", "mân thái", "sơn trà", "mân quang", "vũng thùng", "cổ mân", "nam thọ", "tân thái", "đông hải", "nại thịnh", "nại hưng", "nại nghĩa", "nại tú", "hoàng sa", "yết kiêu", "lê đức thọ", "chu huy mân"]),
        ("Phường Ngũ Hành Sơn", ["mỹ an", "khuê mỹ", "hòa hải", "hòa quý", "ngũ hành sơn", "an thượng", "mỹ đa", "mỹ khê", "khuê bắc", "sơn thủy", "thủy sơn", "mộc sơn", "đa mặn", "khái đông", "khái tây", "quán khái", "vùng trung", "đồng khoa", "bá giáng", "đông trà", "nam sơn", "tân trà", "non nước", "trần đại nghĩa", "mai đăng chơn", "võ chí công", "bình kỳ", "an dương vương"]),
        ("Phường Hòa Khánh", ["hòa khánh nam", "hòa minh", "hòa sơn", "hòa khánh", "xuân thiều", "bàu trảng", "bàu mạc", "bàu năng", "bàu sen", "bàu làng", "hòa mỹ", "hòa nam", "hòa phú", "chơn tâm", "trung nghĩa", "đàm thanh", "phú lộc", "thanh vinh", "đồng trí", "phú thạnh", "đà sơn", "tôn đức thắng", "nam trân", "an ngãi", "âu cơ", "bắc sơn"]),
        ("Phường Liên Chiểu", ["hòa khánh bắc", "hòa liên", "liên chiểu", "hồng phước", "đa phước", "bàu tràm", "suối lương", "nguyễn sinh sắc", "hoàng thị loan", "nguyễn lương bằng"]),
        ("Phường Hải Vân", ["hòa hiệp", "hòa bắc", "hải vân", "kim liên", "suối đá"]),
        ("Phường Cẩm Lệ", ["hòa thọ", "khuê trung", "cẩm lệ", "an hòa", "phong bắc", "thăng long", "yến bắc", "bình thái", "cẩm bắc", "cẩm chánh", "bình hòa", "ông ích đường", "cách mạng tháng 8"]),
        ("Phường Hòa Xuân", ["hòa xuân", "hòa phước", "hòa châu", "cồn dầu", "liêm lạc", "bàu cầu", "nhơn hòa", "thanh lương", "lỗ giáng", "văn thánh", "miếu bông", "tùng lâm", "giáng hương", "bờ quan", "bờ đằm", "hói kiểng", "đồng lớn", "trung lương", "29 tháng 3", "nguyễn phước lan", "ban ban", "bàu gia", "bàu nghè", "bắc thượng", "bàu vàng"]),
        ("Phường Hội An", ["minh an", "cẩm phô", "sơn phong", "cẩm nam", "cẩm kim", "hội an", "la hối", "phố cổ"]),
        ("Phường Hội An Đông", ["cửa đại", "cẩm châu", "cẩm thanh", "rừng dừa", "hội an đông"]),
        ("Phường Hội An Tây", ["thanh hà", "tân an", "cẩm an", "cẩm hà", "hội an tây"]),
        ("Phường Điện Bàn", ["điện phương", "điện minh", "vĩnh điện", "điện bàn"]),
        ("Phường Điện Bàn Đông", ["điện nam", "điện dương", "điện ngọc", "viêm đông", "điện bàn đông", "dũng sĩ điện ngọc"]),
        ("Phường An Thắng", ["an thắng", "điện an", "điện thắng"]),
        ("Phường Điện Bàn Bắc", ["điện hòa", "điện tiến", "điện bàn bắc"]),
        ("Phường Tam Kỳ", ["tam kỳ", "an xuân", "trường xuân", "thuận trà", "phan bội châu"]),
        ("Phường Quảng Phú", ["quảng phú", "an phú", "tam thanh", "tam phú"]),
        ("Phường Hương Trà", ["hương trà", "an sơn", "hòa hương", "tam ngọc"]),
        ("Phường Bàn Thạch", ["bàn thạch", "tân thạnh", "tam thăng"])
    ];

    public LandPriceStore(IWebHostEnvironment env, ILogger<LandPriceStore> logger)
    {
        _logger = logger;
        _dataFileDir = Path.Combine(env.ContentRootPath, "data");
        _dataFilePath = Path.Combine(_dataFileDir, "landPrices.json");
        _wardCachePath = Path.Combine(_dataFileDir, "wardCache.json");

        LoadWardCache();
        LoadLocalData();
    }

    private void LoadWardCache()
    {
        try
        {
            if (File.Exists(_wardCachePath))
            {
                var json = File.ReadAllText(_wardCachePath);
                var cache = JsonSerializer.Deserialize<Dictionary<string, string>>(json);
                if (cache != null)
                {
                    _wardCache = new Dictionary<string, string>(cache, StringComparer.OrdinalIgnoreCase);
                    _logger.LogInformation("Loaded {Count} cached wards from {Path}", _wardCache.Count, _wardCachePath);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to load wardCache.json");
        }
    }

    private void LoadLocalData()
    {
        try
        {
            // Kiểm tra file dữ liệu local trong thư mục dự án hoặc copy từ backend cũ
            var fallbackSources = new[]
            {
                _dataFilePath,
                Path.Combine(Directory.GetCurrentDirectory(), "..", "backend", "src", "data", "landPrices.json")
            };

            foreach (var src in fallbackSources)
            {
                if (File.Exists(src))
                {
                    var json = File.ReadAllText(src);
                    var items = JsonSerializer.Deserialize<List<LandPriceItem>>(json);
                    if (items != null && items.Count > 0)
                    {
                        UpdateItems(items);
                        _logger.LogInformation("Loaded {Count} initial land price records from {Source}", items.Count, src);
                        return;
                    }
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Could not load initial local land price data");
        }
    }

    public string GetExactWard(LandPriceItem item)
    {
        var rawStreet = (item.TenDuong ?? "").Trim().ToLower();
        var rawDvhc = (item.TenDvhc ?? "").Trim().ToLower();

        // 1. Kiểm tra trong file wardCache
        if (!string.IsNullOrEmpty(item.TenDuong) && _wardCache.TryGetValue(item.TenDuong, out var cachedWard))
        {
            return cachedWard;
        }

        // 2. Kiểm tra keywords theo tên đường
        foreach (var ward in WardMapping)
        {
            if (ward.Keywords.Any(kw => rawStreet.Contains(kw)))
            {
                return ward.NewWard;
            }
        }

        // 3. Kiểm tra keywords theo ĐVHC
        foreach (var ward in WardMapping)
        {
            if (ward.Keywords.Any(kw => rawDvhc.Contains(kw)))
            {
                return ward.NewWard;
            }
        }

        // 4. Nếu đơn vị hành chính ghi rõ phường (không bị phẩy)
        if (rawDvhc.Contains("phường") && !rawDvhc.Contains(","))
        {
            var match = WardMapping.FirstOrDefault(w => rawDvhc.Contains(w.NewWard.ToLower()));
            if (!string.IsNullOrEmpty(match.NewWard)) return match.NewWard;
        }

        return "Đang cập nhật";
    }

    public void UpdateItems(List<LandPriceItem> newItems)
    {
        // Gán phường mới
        foreach (var item in newItems)
        {
            if (string.IsNullOrEmpty(item.PhuongMoiDaNang) || item.PhuongMoiDaNang == "Đang cập nhật")
            {
                item.PhuongMoiDaNang = GetExactWard(item);
            }
        }

        _lock.EnterWriteLock();
        try
        {
            _items = newItems;
        }
        finally
        {
            _lock.ExitWriteLock();
        }

        // Lưu vào file JSON local làm fallback
        try
        {
            if (!Directory.Exists(_dataFileDir))
            {
                Directory.CreateDirectory(_dataFileDir);
            }
            File.WriteAllText(_dataFilePath, JsonSerializer.Serialize(newItems, new JsonSerializerOptions { WriteIndented = true }));
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to write local backup landPrices.json");
        }
    }

    public LandPriceQueryResponse Search(string? street, string? segment, string? dvhc, int limit = 100, int offset = 0)
    {
        _lock.EnterReadLock();
        try
        {
            var query = _items.AsEnumerable();

            // 1. Lọc tên đường
            if (!string.IsNullOrWhiteSpace(street))
            {
                var lowerStreet = street.Trim().ToLower();
                query = query.Where(x => (x.TenDuong ?? "").ToLower().Contains(lowerStreet));
            }

            // 2. Lọc đoạn đường
            if (!string.IsNullOrWhiteSpace(segment))
            {
                var lowerSegment = segment.Trim().ToLower();
                query = query.Where(x => (x.DoanDuong ?? "").ToLower().Contains(lowerSegment));
            }

            // 3. Lọc theo Phường/Xã (ĐVHC)
            if (!string.IsNullOrWhiteSpace(dvhc))
            {
                var lowerDvhc = dvhc.Trim().ToLower();
                var wardKeyword = Regex.Replace(lowerDvhc, @"phường|xã|quận", "", RegexOptions.IgnoreCase).Trim();

                var otherWards = new[]
                {
                    "hải châu", "hòa cường", "thanh khê", "an khê", "an hải", "sơn trà",
                    "ngũ hành sơn", "hòa khánh", "liên chiểu", "hải vân", "cẩm lệ", "hòa xuân"
                }.Where(w => w != wardKeyword).ToArray();

                query = query.Where(item =>
                {
                    var seg = (item.DoanDuong ?? "").ToLower();

                    // Phân tích segment trước
                    if (seg.Contains("phường") || seg.Contains("xã"))
                    {
                        if (seg.Contains(wardKeyword)) return true;
                        if (otherWards.Any(w => seg.Contains(w))) return false;
                    }

                    // Khớp exactWard
                    var exactWard = item.PhuongMoiDaNang;
                    if (!string.IsNullOrEmpty(exactWard) && exactWard != "Đang cập nhật")
                    {
                        return exactWard.ToLower() == lowerDvhc || exactWard.ToLower().Contains(wardKeyword);
                    }

                    // Khớp ten_dvhc
                    var itemDvhc = (item.TenDvhc ?? "").ToLower();
                    return itemDvhc.Contains(wardKeyword) || itemDvhc.Contains(lowerDvhc);
                });
            }

            var list = query.ToList();
            var total = list.Count;

            var paged = list
                .Skip(Math.Max(0, offset))
                .Take(Math.Max(1, limit))
                .ToList();

            return new LandPriceQueryResponse
            {
                Data = paged,
                Total = total
            };
        }
        finally
        {
            _lock.ExitReadLock();
        }
    }
}
