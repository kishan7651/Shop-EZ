import { useOrders } from "@/hooks/use-orders";
import { useUser } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Package, Calendar, MapPin, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { data: user, isLoading: userLoading } = useUser();
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const [, setLocation] = useLocation();

  if (!userLoading && !user) {
    setLocation("/auth");
    return null;
  }

  if (userLoading || ordersLoading) {
    return <div className="container py-12 px-4 animate-pulse h-96 bg-muted rounded-xl mt-8 mx-auto max-w-5xl"></div>;
  }

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="mb-10">
        <h1 className="text-3xl font-display font-bold mb-2">My Account</h1>
        <p className="text-muted-foreground">Welcome back, {user?.name || user?.username}. Manage your orders and account settings.</p>
      </div>

      <div className="space-y-8">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Package className="w-6 h-6 text-primary" /> Order History
        </h2>

        {!orders || orders.length === 0 ? (
          <div className="bg-white border rounded-2xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
            <p className="text-muted-foreground">When you place orders, they will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Order #{order.id.toString().padStart(6, '0')}</p>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      {new Date(order.createdAt!).toLocaleDateString('en-US', { 
                        year: 'numeric', month: 'long', day: 'numeric' 
                      })}
                    </div>
                  </div>
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2">
                    <span className="text-lg font-bold">${parseFloat(order.totalAmount.toString()).toFixed(2)}</span>
                    <Badge variant="outline" className={`${getStatusColor(order.status)} border px-3 py-1 rounded-full text-xs uppercase tracking-wider font-bold`}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                    <p>{order.address}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 shrink-0" />
                    <p>Payment: {order.paymentMethod}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
