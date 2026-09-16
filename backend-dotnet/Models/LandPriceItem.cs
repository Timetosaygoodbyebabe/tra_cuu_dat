using System.Text.Json.Serialization;

namespace LandPriceApi.Models;

public class LandPriceItem
{
    [JsonPropertyName("ten_dvhc")]
    public string? TenDvhc { get; set; }

    [JsonPropertyName("ten_duong")]
    public string? TenDuong { get; set; }

    [JsonPropertyName("doan_duong")]
    public string? DoanDuong { get; set; }

    [JsonPropertyName("gia_dat_o_vt1")]
    public string? GiaDatOVt1 { get; set; }

    [JsonPropertyName("gia_dat_o_vt2")]
    public string? GiaDatOVt2 { get; set; }

    [JsonPropertyName("gia_dat_o_vt3")]
    public string? GiaDatOVt3 { get; set; }

    [JsonPropertyName("gia_dat_o_vt4")]
    public string? GiaDatOVt4 { get; set; }

    [JsonPropertyName("gia_dat_o_vt5")]
    public string? GiaDatOVt5 { get; set; }

    [JsonPropertyName("gia_dat_tmdv_vt1")]
    public string? GiaDatTmdvVt1 { get; set; }

    [JsonPropertyName("gia_dat_tmdv_vt2")]
    public string? GiaDatTmdvVt2 { get; set; }

    [JsonPropertyName("gia_dat_tmdv_vt3")]
    public string? GiaDatTmdvVt3 { get; set; }

    [JsonPropertyName("gia_dat_tmdv_vt4")]
    public string? GiaDatTmdvVt4 { get; set; }

    [JsonPropertyName("gia_dat_tmdv_vt5")]
    public string? GiaDatTmdvVt5 { get; set; }

    [JsonPropertyName("gia_dat_co_so_san_xuat_phi_nong_nghiep_vt1")]
    public string? GiaDatSxVt1 { get; set; }

    [JsonPropertyName("gia_dat_co_so_san_xuat_phi_nong_nghiep_vt2")]
    public string? GiaDatSxVt2 { get; set; }

    [JsonPropertyName("gia_dat_co_so_san_xuat_phi_nong_nghiep_vt3")]
    public string? GiaDatSxVt3 { get; set; }

    [JsonPropertyName("gia_dat_co_so_san_xuat_phi_nong_nghiep_vt4")]
    public string? GiaDatSxVt4 { get; set; }

    [JsonPropertyName("gia_dat_co_so_san_xuat_phi_nong_nghiep_vt5")]
    public string? GiaDatSxVt5 { get; set; }

    [JsonPropertyName("phuong_moi_da_nang")]
    public string? PhuongMoiDaNang { get; set; }
}
