using System.Text.Json.Serialization;

namespace LandPriceApi.Models;

public class IocApiResponse
{
    [JsonPropertyName("success")]
    public bool Success { get; set; }

    [JsonPropertyName("data")]
    public List<LandPriceItem> Data { get; set; } = new();

    [JsonPropertyName("pagination")]
    public IocPagination? Pagination { get; set; }
}

public class IocPagination
{
    [JsonPropertyName("totalCount")]
    public int TotalCount { get; set; }

    [JsonPropertyName("page")]
    public int Page { get; set; }

    [JsonPropertyName("pageSize")]
    public int PageSize { get; set; }

    [JsonPropertyName("totalPages")]
    public int TotalPages { get; set; }
}

public class LandPriceQueryResponse
{
    [JsonPropertyName("data")]
    public List<LandPriceItem> Data { get; set; } = new();

    [JsonPropertyName("total")]
    public int Total { get; set; }
}
