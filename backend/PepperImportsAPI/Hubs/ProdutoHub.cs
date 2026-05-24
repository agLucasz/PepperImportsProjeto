using Microsoft.AspNetCore.SignalR;

namespace PepperImportsAPI.Hubs
{
    public class ProdutoHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            await base.OnConnectedAsync();
        }

        public async Task EntrarNoGrupoCatalogo()
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "catalogo");
        }
    }
}
