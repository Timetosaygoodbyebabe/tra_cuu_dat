using Microsoft.AspNetCore.Mvc;
using LandPriceApi.Services;

namespace LandPriceApi.Controllers;

[ApiController]
[Route("api/land-prices")]
public class LandPricesController : ControllerBase
{
    private readonly LandPriceStore _store;
    private readonly IocSyncWorker _worker;

    public LandPricesController(LandPriceStore store, IocSyncWorker worker)
    {
        _store = store;
        _worker = worker;
    }

    [HttpGet]
    public IActionResult GetLandPrices(
        [FromQuery] string? street,
        [FromQuery] string? segment,
        [FromQuery] string? dvhc,
        [FromQuery] int limit = 100,
        [FromQuery] int offset = 0)
    {
        var result = _store.Search(street, segment, dvhc, limit, offset);
        return Ok(result);
    }

    [HttpPost("sync")]
    public async Task<IActionResult> TriggerSync(CancellationToken cancellationToken)
    {
        await _worker.SyncDataFromIocAsync(cancellationToken);
        return Ok(new { message = "Data sync from IOC 1022 triggered successfully." });
    }
}
