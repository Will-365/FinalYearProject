import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { productService } from '@/services/productService';
import { Search, Star, ShoppingCart, Leaf, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { useDebounce } from '@/utils/adminHelpers';

const CATEGORIES = ['All', 'compost', 'recycled_goods', 'pavers', 'upcycled', 'eco_product'];
const WASTE_TYPES = ['All', 'organic', 'inorganic', 'recyclable', 'mixed'];
const SORTS = [
  { value: 'newest', label: 'Newest Arrivals' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' }
];

export function ProductShop({ onNavigate }) {
  const { user, points, updatePoints } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [category, setCategory] = useState('All');
  const [wasteType, setWasteType] = useState('All');
  const [sort, setSort] = useState('newest');
  const [inStock, setInStock] = useState(false);

  // Modals
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(null);

  // Purchase State
  const [paymentMethod, setPaymentMethod] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        category: category === 'All' ? '' : category,
        wasteType: wasteType === 'All' ? '' : wasteType,
        search: debouncedSearch,
        inStock: inStock ? 'true' : '',
        sortBy: sort.replace('_asc', '').replace('_desc', ''),
        sortOrder: sort.includes('desc') ? 'desc' : 'asc'
      };
      const res = await productService.getAll(params);
      const data = res.data || res;
      const productsArray = data.products || data.items || (Array.isArray(data) ? data : []);
      setProducts(productsArray);
    } catch (err) {
      setError(err.message || 'Failed to load products');
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category, wasteType, debouncedSearch, inStock, sort]);

  const handlePurchase = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;
    if (!paymentMethod) { toast.error('Select a payment method'); return; }
    
    // Guest validation
    if (!user && (!guestName || !guestPhone)) {
      toast.error('Please provide your name and phone number');
      return;
    }

    setPurchaseLoading(true);
    try {
      const body = {
        paymentMethod,
        quantity,
        deliveryAddress: deliveryAddress || undefined,
        buyerName: !user ? guestName : undefined,
        buyerPhone: !user ? guestPhone : undefined,
      };
      const res = await productService.buy(selectedProduct._id || selectedProduct.id, body);
      
      if (paymentMethod === 'points' && user?.role === 'resident') {
        const totalPts = (selectedProduct.pointsCost || 0) * quantity;
        updatePoints(points - totalPts);
      }
      
      setPurchaseModalOpen(false);
      setOrderConfirmed({ ...res, product: selectedProduct });
      if (paymentMethod === 'points') {
        toast.success(`Order confirmed using ${selectedProduct.pointsCost * quantity} points.`);
      } else {
        toast.success(`Order placed! Pay ${selectedProduct.cashPrice * quantity} RWF on delivery.`);
      }
      fetchProducts();
    } catch (err) {
      toast.error(err.message || 'Purchase failed');
    } finally {
      setPurchaseLoading(false);
    }
  };

  // Helper to generate dummy rating stars for the Amazon look
  const renderStars = () => {
    return (
      <div className="flex items-center gap-0.5 text-[#FFA41C] mt-1 mb-1">
        {[1,2,3,4].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
        <Star className="w-4 h-4 fill-current opacity-50" />
        <span className="text-[#007185] text-xs hover:text-[#C7511F] hover:underline cursor-pointer ml-1">
          {Math.floor(Math.random() * 200) + 15}
        </span>
      </div>
    );
  };

  return (
    <div className="bg-white min-h-screen text-[#0F1111] font-sans">
      
      {/* Search & Header Bar (Amazon Style) */}
      <div className="bg-[#232F3E] p-3 flex flex-col md:flex-row items-center gap-4 sticky top-0 z-10">
        <div className="flex-1 flex w-full max-w-4xl mx-auto md:mx-0">
          <div className="flex w-full rounded-md overflow-hidden ring-2 ring-transparent focus-within:ring-[#F3A847]">
            <select 
              value={category} 
              onChange={e => setCategory(e.target.value)}
              className="bg-gray-100 border-r border-gray-300 text-sm text-gray-700 px-3 outline-none cursor-pointer hidden md:block"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c === 'All' ? 'All Departments' : c.replace('_', ' ')}</option>)}
            </select>
            <input 
              type="text" 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search GreenCare Eco Shop" 
              className="flex-1 px-3 py-2 outline-none text-black"
            />
            <button className="bg-[#FEBD69] hover:bg-[#F3A847] px-4 flex items-center justify-center transition-colors">
              <Search className="h-5 w-5 text-gray-900" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1500px] mx-auto flex flex-col md:flex-row px-4 py-4 gap-6">
        
        {/* Left Sidebar Filters */}
        <div className="w-full md:w-[240px] shrink-0 border-r border-gray-200 pr-4 hidden md:block">
          <div className="mb-6">
            <h3 className="font-bold text-sm mb-2">Department</h3>
            <ul className="space-y-1.5 text-sm">
              {CATEGORIES.map(c => (
                <li key={c}>
                  <button 
                    onClick={() => setCategory(c)}
                    className={`hover:text-[#C7511F] text-left w-full ${category === c ? 'font-bold text-black' : 'text-[#0F1111]'}`}
                  >
                    {c === 'All' ? 'All Eco Products' : c.replace('_', ' ')}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="font-bold text-sm mb-2">Customer Reviews</h3>
            <div className="space-y-2">
              <div className="flex items-center cursor-pointer hover:text-[#C7511F]">
                <div className="flex text-[#FFA41C] mr-1"><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 text-gray-300 fill-current"/></div>
                <span className="text-sm">& Up</span>
              </div>
              <div className="flex items-center cursor-pointer hover:text-[#C7511F]">
                <div className="flex text-[#FFA41C] mr-1"><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 text-gray-300 fill-current"/><Star className="w-4 h-4 text-gray-300 fill-current"/></div>
                <span className="text-sm">& Up</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-bold text-sm mb-2">Source Waste</h3>
            <ul className="space-y-1.5 text-sm">
              {WASTE_TYPES.map(w => (
                <li key={w}>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="wasteType"
                      checked={wasteType === w}
                      onChange={() => setWasteType(w)}
                      className="text-[#007185] focus:ring-[#007185]"
                    />
                    <span className="group-hover:text-[#C7511F] capitalize">{w}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="font-bold text-sm mb-2">Availability</h3>
            <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-[#C7511F]">
              <input 
                type="checkbox" 
                checked={inStock} 
                onChange={e => setInStock(e.target.checked)}
                className="rounded-sm border-gray-300 text-[#007185] focus:ring-[#007185]"
              />
              <span>Include Out of Stock</span>
            </label>
          </div>
        </div>

        {/* Main Grid */}
        <div className="flex-1">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 pb-2 border-b border-gray-200">
            <span className="text-sm text-gray-600 font-medium">
              {loading ? 'Loading...' : `Over ${products.length} results`}
            </span>
            <div className="flex items-center gap-2 text-sm mt-2 sm:mt-0 shadow-sm border border-gray-300 rounded-md px-2 py-1 bg-[#F0F2F2] hover:bg-[#E3E6E6] cursor-pointer">
              <span className="text-gray-600">Sort by:</span>
              <select 
                value={sort} 
                onChange={e => setSort(e.target.value)}
                className="bg-transparent font-medium outline-none cursor-pointer"
              >
                {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200 mb-4" />
                  <div className="h-4 bg-gray-200 w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 w-1/2" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600 font-medium">{error}</div>
          ) : products.length === 0 ? (
            <div className="py-12">
              <h2 className="text-xl font-bold mb-2">No results for your search.</h2>
              <p className="text-sm text-gray-600">Try checking your spelling or use more general terms</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map(product => (
                <div 
                  key={product._id || product.id}
                  className="flex flex-col h-full bg-white group"
                >
                  {/* Product Image */}
                  <div 
                    onClick={() => setSelectedProduct(product)}
                    className="relative bg-[#F8F8F8] h-56 w-full flex items-center justify-center p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <img 
                      src={product.imageUrl || '/placeholder-product.svg'} 
                      alt={product.name}
                      className="max-h-full max-w-full object-contain mix-blend-multiply"
                      onError={e => e.currentTarget.src = '/placeholder-product.svg'}
                    />
                    {product.sourceWaste && (
                      <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded text-[10px] font-bold text-green-700 uppercase tracking-wide">
                        <Leaf className="w-3 h-3" /> Eco Choice
                      </div>
                    )}
                  </div>
                  
                  {/* Product Details */}
                  <div className="pt-3 flex-1 flex flex-col">
                    <h3 
                      onClick={() => setSelectedProduct(product)}
                      className="text-base text-[#0F1111] leading-tight line-clamp-2 hover:text-[#C7511F] cursor-pointer"
                    >
                      {product.name}
                    </h3>
                    
                    <p className="text-xs text-[#007185] mt-1 hover:underline cursor-pointer">
                      Brand: {product.partner || 'GreenCare'}
                    </p>

                    {renderStars()}

                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="text-[11px] font-medium leading-none align-top pt-1">RWF</span>
                      <span className="text-[28px] font-semibold leading-none">{product.cashPrice?.toLocaleString()}</span>
                    </div>

                    {product.pointsCost > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        or pay with <span className="font-semibold text-emerald-700">{product.pointsCost} points</span>
                      </p>
                    )}

                    <div className="mt-2 text-xs text-[#565959]">
                      Delivery available in Rwanda.
                    </div>

                    <div className="mt-auto pt-3">
                      {product.stock > 0 ? (
                        <>
                          <p className="text-xs text-[#007600] font-bold mb-2">In Stock</p>
                          <button 
                            onClick={() => {
                              setSelectedProduct(product);
                              setQuantity(1);
                              setPaymentMethod('');
                              setPurchaseModalOpen(true);
                            }}
                            className="w-full py-1.5 rounded-full bg-[#FFD814] hover:bg-[#F7CA00] text-sm font-medium border border-[#FCD200] shadow-sm transition-colors active:shadow-inner"
                          >
                            Add to Cart
                          </button>
                        </>
                      ) : (
                        <>
                          <p className="text-xs text-[#B12704] font-bold mb-2">Currently unavailable.</p>
                          <button disabled className="w-full py-1.5 rounded-full bg-gray-100 text-gray-500 text-sm font-medium border border-gray-200 cursor-not-allowed">
                            Out of Stock
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product Detail Modal (Styled like Amazon Quick View) */}
      <Dialog open={!!selectedProduct && !purchaseModalOpen && !orderConfirmed} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent aria-describedby={undefined} className="max-w-4xl p-6 bg-white rounded-lg">
          {selectedProduct && (
            <div className="flex flex-col md:flex-row gap-8">
              {/* Image Side */}
              <div className="w-full md:w-[400px] shrink-0">
                <div className="bg-gray-50 aspect-square w-full flex items-center justify-center p-8 border border-gray-200 rounded-md">
                  <img 
                    src={selectedProduct.imageUrl || '/placeholder-product.svg'} 
                    alt={selectedProduct.name}
                    className="max-h-full max-w-full object-contain mix-blend-multiply"
                  />
                </div>
              </div>
              
              {/* Details Side */}
              <div className="flex-1 flex flex-col">
                <div className="border-b border-gray-200 pb-3 mb-3">
                  <h2 className="text-2xl text-[#0F1111] leading-tight mb-1">{selectedProduct.name}</h2>
                  <p className="text-sm text-[#007185] hover:underline cursor-pointer">Visit the {selectedProduct.partner || 'GreenCare'} Store</p>
                  <div className="mt-2">{renderStars()}</div>
                </div>

                <div className="mb-4">
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-sm font-medium leading-none align-top pt-2">RWF</span>
                    <span className="text-[32px] font-medium leading-none text-[#B12704]">{selectedProduct.cashPrice?.toLocaleString()}</span>
                  </div>
                  {selectedProduct.pointsCost > 0 && (
                    <div className="text-sm text-gray-600 bg-emerald-50 inline-block px-2 py-1 border border-emerald-100 rounded">
                      Can also be purchased with <span className="font-bold text-emerald-700">{selectedProduct.pointsCost} Green Points</span>
                    </div>
                  )}
                </div>

                <div className="prose prose-sm text-[#0F1111] mb-6 border-t border-gray-200 pt-4">
                  <h4 className="font-bold mb-2">About this item</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>{selectedProduct.description || 'Premium eco-friendly product crafted sustainably.'}</li>
                    <li>Category: {selectedProduct.category?.replace('_', ' ')}</li>
                    {selectedProduct.sourceWaste && (
                      <li>Made using {selectedProduct.sourceWaste.weightKg}kg of recycled {selectedProduct.sourceWaste.wasteType}.</li>
                    )}
                  </ul>
                </div>

                {/* Buy Box */}
                <div className="mt-auto border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <p className="text-lg text-[#007600] font-medium mb-3">
                    {selectedProduct.stock > 0 ? 'In Stock' : 'Out of Stock'}
                  </p>
                  
                  <div className="flex gap-3">
                    <Button 
                      className="flex-1 h-10 rounded-full bg-[#FFD814] hover:bg-[#F7CA00] text-black font-medium border border-[#FCD200]"
                      onClick={() => {
                        setQuantity(1);
                        setPaymentMethod('');
                        setPurchaseModalOpen(true);
                      }}
                      disabled={selectedProduct.stock === 0}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Button 
                      className="flex-1 h-10 rounded-full bg-[#FFA41C] hover:bg-[#FA8900] text-black font-medium border border-[#FF8F00]"
                      onClick={() => {
                        setQuantity(1);
                        setPaymentMethod('');
                        setPurchaseModalOpen(true);
                      }}
                      disabled={selectedProduct.stock === 0}
                    >
                      Buy Now
                    </Button>
                  </div>
                  
                  <div className="mt-4 text-xs text-gray-500 space-y-1">
                    <div className="flex justify-between"><span className="w-24">Ships from</span><span className="text-[#0F1111]">GreenCare</span></div>
                    <div className="flex justify-between"><span className="w-24">Sold by</span><span className="text-[#0F1111]">{selectedProduct.partner || 'GreenCare Rwanda'}</span></div>
                    <div className="flex justify-between"><span className="w-24">Returns</span><span className="text-[#007185] hover:underline cursor-pointer">Eligible for Return</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Purchase Modal */}
      <Dialog open={purchaseModalOpen} onOpenChange={setPurchaseModalOpen}>
        <DialogContent aria-describedby={undefined} className="max-w-md bg-white p-6 rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-normal border-b pb-3">Checkout</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <form onSubmit={handlePurchase} className="space-y-5 mt-2 text-[#0F1111]">
              
              <div className="flex items-start gap-4">
                <img src={selectedProduct.imageUrl} className="w-20 h-20 object-contain bg-gray-50 border border-gray-200 rounded p-2" />
                <div>
                  <h3 className="font-bold text-sm line-clamp-2">{selectedProduct.name}</h3>
                  <div className="text-[#B12704] font-bold mt-1">RWF {selectedProduct.cashPrice?.toLocaleString()}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm font-medium bg-gray-100 px-2 py-1 rounded border border-gray-300">Qty:</span>
                    <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="h-7 w-7 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center">-</button>
                    <span className="text-sm font-bold w-6 text-center">{quantity}</span>
                    <button type="button" onClick={() => setQuantity(Math.min(selectedProduct.stock, quantity + 1))} className="h-7 w-7 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center">+</button>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-bold text-lg mb-3">Payment method</h3>
                <div className="space-y-3">
                  {user?.role === 'resident' && selectedProduct.pointsCost > 0 && (
                    <label className={`flex items-start gap-3 p-3 border rounded-md cursor-pointer ${paymentMethod === 'points' ? 'bg-[#FDF8E3] border-[#F3A847]' : 'border-gray-300'}`}>
                      <input type="radio" name="payment" value="points" checked={paymentMethod === 'points'} onChange={() => setPaymentMethod('points')} className="mt-1" disabled={points < selectedProduct.pointsCost * quantity} />
                      <div className="flex-1">
                        <span className="font-bold">Pay with Green Points</span>
                        <div className="text-sm text-gray-600 mt-1">Cost: {selectedProduct.pointsCost * quantity} pts</div>
                        <div className="text-xs text-gray-500 mt-1">Available balance: {points} pts</div>
                      </div>
                    </label>
                  )}

                  <label className={`flex items-start gap-3 p-3 border rounded-md cursor-pointer ${paymentMethod === 'mobile_money' ? 'bg-[#FDF8E3] border-[#F3A847]' : 'border-gray-300'}`}>
                    <input type="radio" name="payment" value="mobile_money" checked={paymentMethod === 'mobile_money'} onChange={() => setPaymentMethod('mobile_money')} className="mt-1" />
                    <div>
                      <span className="font-bold">Mobile Money (MTN/Airtel)</span>
                      <div className="text-sm text-gray-600 mt-1">Total: RWF {(selectedProduct.cashPrice * quantity).toLocaleString()}</div>
                    </div>
                  </label>

                  <label className={`flex items-start gap-3 p-3 border rounded-md cursor-pointer ${paymentMethod === 'cash' ? 'bg-[#FDF8E3] border-[#F3A847]' : 'border-gray-300'}`}>
                    <input type="radio" name="payment" value="cash" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} className="mt-1" />
                    <div>
                      <span className="font-bold">Pay on Delivery</span>
                      <div className="text-sm text-gray-600 mt-1">Total: RWF {(selectedProduct.cashPrice * quantity).toLocaleString()}</div>
                    </div>
                  </label>
                </div>
              </div>

              {!user && (
                <div className="border-t pt-4 space-y-3">
                  <h3 className="font-bold text-lg mb-2">Guest Details</h3>
                  <Input placeholder="Full Name" value={guestName} onChange={e => setGuestName(e.target.value)} required className="h-10 border-gray-400 focus:border-[#F3A847]" />
                  <Input type="tel" placeholder="Phone Number" value={guestPhone} onChange={e => setGuestPhone(e.target.value)} required className="h-10 border-gray-400 focus:border-[#F3A847]" />
                </div>
              )}

              {(paymentMethod === 'cash' || paymentMethod === 'mobile_money') && (
                <div className="border-t pt-4 space-y-3">
                  <h3 className="font-bold text-lg mb-2">Shipping address</h3>
                  <Input placeholder="E.g. Gasabo, Kigali" value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} className="h-10 border-gray-400 focus:border-[#F3A847]" />
                </div>
              )}

              <div className="border-t pt-4">
                <Button type="submit" disabled={purchaseLoading} className="w-full h-11 bg-[#FFD814] hover:bg-[#F7CA00] text-black font-normal rounded-lg border border-[#FCD200] shadow-sm">
                  {purchaseLoading ? 'Processing...' : 'Place your order in RWF'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Card */}
      <Dialog open={!!orderConfirmed} onOpenChange={() => { setOrderConfirmed(null); setSelectedProduct(null); }}>
        <DialogContent aria-describedby={undefined} className="max-w-md bg-white p-6 rounded-lg text-center">
          <div className="mb-4">
            <CheckCircle2 className="h-12 w-12 text-[#007600] mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-[#0F1111] mb-2">Order placed, thank you!</h2>
          <p className="text-sm text-gray-600 mb-6">Confirmation will be sent to your email.</p>
          
          <div className="border border-gray-200 rounded-lg p-4 mb-6 text-left">
            <h4 className="font-bold text-[#0F1111] mb-2">Order Details</h4>
            <p className="text-sm text-[#007185] hover:underline cursor-pointer">{orderConfirmed?.product?.name}</p>
            <p className="text-sm text-gray-600 mt-2">Quantity: {quantity}</p>
            <p className="text-sm font-bold text-[#B12704] mt-2">
              Order Total: {paymentMethod === 'points' ? (orderConfirmed?.product?.pointsCost * quantity + ' pts') : ('RWF ' + (orderConfirmed?.product?.cashPrice * quantity).toLocaleString())}
            </p>
          </div>

          <Button onClick={() => { setOrderConfirmed(null); setSelectedProduct(null); }} className="w-full h-10 bg-gray-100 hover:bg-gray-200 text-black border border-gray-300 rounded-lg shadow-sm">
            Continue Shopping
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
