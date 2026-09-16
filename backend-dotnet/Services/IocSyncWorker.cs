using System.Net.Http.Json;
using LandPriceApi.Models;

namespace LandPriceApi.Services;

public class IocSyncWorker : BackgroundService
{
    private readonly ILogger<IocSyncWorker> _logger;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly LandPriceStore _store;
    private readonly IConfiguration _config;

    public IocSyncWorker(
        ILogger<IocSyncWorker> logger,
        IHttpClientFactory httpClientFactory,
        LandPriceStore store,
        IConfiguration config)
    {
        _logger = logger;
        _httpClientFactory = httpClientFactory;
        _store = store;
        _config = config;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("IocSyncWorker started.");

        // Chạy đồng bộ lần đầu tiên ngay khi khởi động
        await SyncDataFromIocAsync(stoppingToken);

        var intervalHours = _config.GetValue<int>("IocApi:SyncIntervalHours", 24);
        if (intervalHours <= 0) intervalHours = 24;

        using var timer = new PeriodicTimer(TimeSpan.FromHours(intervalHours));

        while (!stoppingToken.IsCancellationRequested && await timer.WaitForNextTickAsync(stoppingToken))
        {
            await SyncDataFromIocAsync(stoppingToken);
        }
    }

    public async Task SyncDataFromIocAsync(CancellationToken cancellationToken = default)
    {
        var baseUrl = _config["IocApi:BaseUrl"] ?? "https://ioc-api.1022.vn/api/gia-dat/";
        var apiKey = _config["IocApi:ApiKey"] ?? "d9d368ec-6193-4eed-9f25-84a4b600e777";

        _logger.LogInformation("Starting data sync from IOC 1022 API: {Url}", baseUrl);

        var client = _httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Clear();
        client.DefaultRequestHeaders.Add("X-Api-Key", apiKey);
        client.Timeout = TimeSpan.FromSeconds(30);

        var allItems = new List<LandPriceItem>();
        int currentPage = 1;
        const int pageSize = 100;
        int totalPages = 1;

        try
        {
            do
            {
                var url = $"{baseUrl.TrimEnd('/')}/?page={currentPage}&pageSize={pageSize}";
                var response = await client.GetFromJsonAsync<IocApiResponse>(url, cancellationToken);

                if (response == null || !response.Success || response.Data == null)
                {
                    _logger.LogWarning("Failed to fetch page {Page} from IOC API", currentPage);
                    break;
                }

                allItems.AddRange(response.Data);

                if (response.Pagination != null)
                {
                    totalPages = response.Pagination.TotalPages;
                }

                _logger.LogInformation("Downloaded page {Current}/{Total} ({Items} records)", currentPage, totalPages, allItems.Count);
                currentPage++;

            } while (currentPage <= totalPages && !cancellationToken.IsCancellationRequested);

            if (allItems.Count > 0)
            {
                _store.UpdateItems(allItems);
                _logger.LogInformation("Successfully synced {Count} records from IOC 1022 into LandPriceStore.", allItems.Count);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred during IOC data synchronization");
        }
    }
}
