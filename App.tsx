
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { INITIAL_DAYS, CATEGORY_STYLES } from './constants';
import { DayPlan, ItineraryItem, TabType, Category, ChatMessage } from './types';
import { getChatResponse, optimizeFullDayItinerary } from './services/geminiService';
import { GoogleGenAI } from "@google/genai";

// --- Global Leaflet Types ---
declare const L: any;

// --- Helpers ---
const getTransportIcon = (mode?: string) => {
  switch (mode) {
    case 'walk': return 'fa-person-walking';
    case 'car': return 'fa-car';
    case 'train': return 'fa-train-subway';
    case 'plane': return 'fa-plane';
    default: return 'fa-ellipsis';
  }
};

// --- Sub-components ---

interface HeaderProps {
  currentTab: TabType;
  setTab: (tab: TabType) => void;
}

const Header: React.FC<HeaderProps> = ({ currentTab, setTab }) => (
  <header className="bg-primary text-white pt-[calc(1.5rem+env(safe-area-inset-top))] pb-16 px-6 rounded-b-[2.5rem] shadow-lg relative shrink-0 z-[60] transition-all duration-500">
    <div className="flex justify-between items-start">
      <div>
        <div className="flex items-center space-x-2 text-blue-200 text-[10px] font-bold tracking-wider mb-1 uppercase">
          <i className="fa-solid fa-plane-up"></i>
          <span>Fukuoka Trip</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight font-display uppercase">FUKUOKA 2026</h1>
      </div>
      <div className="text-right">
        <i className="fa-solid fa-cloud-sun text-2xl text-highlight mb-1"></i>
        <div className="text-xs font-bold">8°C</div>
      </div>
    </div>

    <div className="absolute -bottom-6 left-6 right-6 flex justify-between z-[70]">
      <div className="flex space-x-1.5">
        <TabButton active={currentTab === 'itinerary'} onClick={() => setTab('itinerary')} icon="fa-calendar-day" label="行程" />
        <TabButton active={currentTab === 'map'} onClick={() => setTab('map')} icon="fa-map-location-dot" label="地圖" />
        <TabButton active={currentTab === 'info'} onClick={() => setTab('info')} icon="fa-circle-info" label="資訊" />
        <TabButton active={currentTab === 'currency'} onClick={() => setTab('currency')} icon="fa-calculator" label="匯率" />
      </div>
      <TabButton active={currentTab === 'chat'} onClick={() => setTab('chat')} icon="fa-robot" label="助理" isSpecial />
    </div>
  </header>
);

const TabButton: React.FC<{ active: boolean; onClick: () => void; icon: string; label: string; isSpecial?: boolean }> = ({ active, onClick, icon, label, isSpecial }) => (
  <button 
    onClick={onClick}
    className={`w-11 h-11 rounded-full flex flex-col items-center justify-center transition-all duration-300 transform active:scale-90 border-2 fab-shadow ${
      active 
        ? (isSpecial ? 'bg-highlight text-white border-highlight scale-110' : 'bg-highlight text-white border-white scale-110')
        : 'bg-white text-slate-400 border-white'
    }`}
  >
    <i className={`fa-solid ${icon} text-base`}></i>
  </button>
);

const MapComponent: React.FC<{ 
  itinerary: ItineraryItem[]; 
  isVisible: boolean;
  onSelectItem: (item: ItineraryItem | null) => void;
  selectedItemId: string | null;
}> = ({ itinerary, isVisible, onSelectItem, selectedItemId }) => {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const clusterGroupRef = useRef<any>(null);
  const pathLayerRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    mapRef.current = L.map(containerRef.current, { zoomControl: false, attributionControl: false }).setView([33.5902, 130.4206], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png').addTo(mapRef.current);
    clusterGroupRef.current = L.markerClusterGroup({ showCoverageOnHover: false, maxClusterRadius: 35 }).addTo(mapRef.current);
    
    mapRef.current.on('click', (e: any) => {
      if (e.originalEvent.target.id === 'map-container' || e.originalEvent.target.tagName === 'path' || e.originalEvent.target.classList.contains('leaflet-container')) {
        onSelectItem(null);
      }
    });

    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, [onSelectItem]);

  useEffect(() => {
    if (!mapRef.current || !clusterGroupRef.current) return;
    
    clusterGroupRef.current.clearLayers();
    if (pathLayerRef.current) {
      mapRef.current.removeLayer(pathLayerRef.current);
      pathLayerRef.current = null;
    }

    const coords: any[] = [];
    
    itinerary.forEach((item) => {
      if (item.lat && item.lng) {
        const style = CATEGORY_STYLES[item.category] || CATEGORY_STYLES['其他'];
        const isSelected = item.id === selectedItemId;
        coords.push([item.lat, item.lng]);
        
        const icon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div class="marker-pin shadow-lg flex items-center justify-center transition-all duration-300 ${isSelected ? 'scale-150 z-[2000] border-highlight' : 'scale-100 opacity-90'}" style="background-color: ${style.hex}; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2.5px solid white;">
                  <i class="${style.icon}" style="transform: rotate(45deg); color: white; font-size: 12px;"></i>
                </div>`,
          iconSize: [32, 44], iconAnchor: [16, 44]
        });

        const marker = L.marker([item.lat, item.lng], { icon });
        marker.on('click', (e: any) => {
          L.DomEvent.stopPropagation(e);
          onSelectItem(item);
        });
        clusterGroupRef.current.addLayer(marker);
      }
    });

    if (coords.length > 1) {
      pathLayerRef.current = L.polyline(coords, {
        color: '#1e3a8a',
        weight: 3,
        opacity: 0.6,
        className: 'leaflet-ant-path',
        lineJoin: 'round'
      }).addTo(mapRef.current);

      if (isVisible && !selectedItemId) {
        mapRef.current.fitBounds(pathLayerRef.current.getBounds(), { padding: [50, 50], maxZoom: 15 });
      }
    }

    if (isVisible) {
      setTimeout(() => mapRef.current.invalidateSize(), 100);
    }
  }, [itinerary, selectedItemId, isVisible, onSelectItem]);

  return <div id="map-container" ref={containerRef} className="w-full h-full z-0" />;
};

const ItineraryCard: React.FC<{ 
  item: ItineraryItem; 
  isFirst: boolean;
  onEdit: (it: ItineraryItem) => void; 
}> = ({ item, isFirst, onEdit }) => {
  const style = CATEGORY_STYLES[item.category] || CATEGORY_STYLES['其他'];
  
  return (
    <div className="relative group mb-1 animate-fade-in">
      {!isFirst && (
        <div className="ml-6 border-l-2 border-dashed border-slate-200 pl-8 py-4 relative">
          <div className="absolute -left-[7px] top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border-2 border-slate-300 rounded-full"></div>
          <div className="bg-slate-100/60 rounded-xl p-2.5 border border-slate-100 flex items-center justify-between active:bg-slate-200 transition-colors" onClick={(e) => {
            e.stopPropagation();
            if (item.lat) window.open(`https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}&travelmode=transit`, '_blank');
          }}>
            <div className="flex items-center space-x-2">
              <i className={`fa-solid ${getTransportIcon(item.transportMode)} text-blue-500 text-xs`}></i>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{item.transportDetail || '前往此地'}</span>
            </div>
            <i className="fa-solid fa-chevron-right text-[8px] text-slate-300"></i>
          </div>
        </div>
      )}

      <div 
        className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 active:border-blue-200 transition-all flex flex-col space-y-3"
        onClick={() => onEdit(item)}
      >
        <div className="flex items-start space-x-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm shrink-0 shadow-sm ${style.color}`}>
            <i className={style.icon}></i>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-slate-800 text-sm leading-tight truncate">{item.name}</h3>
              <span className="text-[10px] font-bold text-slate-400 shrink-0 ml-2">{item.startTime}</span>
            </div>
            <div className="mt-1 flex items-center space-x-2">
              <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded uppercase tracking-tighter">{item.category}</span>
              {item.notes && <p className="text-[10px] text-slate-500 truncate italic">"{item.notes}"</p>}
            </div>
          </div>
        </div>
        {(item.openingHours || item.bookingLink) && (
          <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-medium">
              {item.openingHours && (
                <>
                  <i className="fa-regular fa-clock text-blue-400"></i>
                  <span className="truncate max-w-[150px]">{item.openingHours}</span>
                </>
              )}
            </div>
            {item.bookingLink && (
              <button onClick={(e) => { e.stopPropagation(); window.open(item.bookingLink, '_blank'); }} className="text-[10px] bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold active:scale-95 transition-all border border-blue-100">預約官網 <i className="fa-solid fa-arrow-up-right-from-square ml-1 text-[8px]"></i></button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('itinerary');
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [days, setDays] = useState<DayPlan[]>(INITIAL_DAYS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItineraryItem | null>(null);
  const [formData, setFormData] = useState<Partial<ItineraryItem>>({});
  const [selectedMapItem, setSelectedMapItem] = useState<ItineraryItem | null>(null);
  
  // --- 匯率相關狀態 ---
  const [jpyAmount, setJpyAmount] = useState<string>('1000');
  const [twdAmount, setTwdAmount] = useState<string>('');
  const [exchangeRate, setExchangeRate] = useState<number>(0.215); // 預設匯率
  const [isUpdatingRate, setIsUpdatingRate] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('2025-01-01');

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationPreview, setOptimizationPreview] = useState<{ reasoning: string, items: ItineraryItem[] } | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([{role: 'model', text: '你好！我是福岡管家。我可以幫你查天氣、找景點，或是幫你更新行程喔！'}]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 初始換算
    const val = parseFloat(jpyAmount) * exchangeRate;
    setTwdAmount(isNaN(val) ? '' : val.toFixed(0));
  }, [exchangeRate]);

  const updateJpy = (val: string) => {
    setJpyAmount(val);
    const num = parseFloat(val);
    setTwdAmount(isNaN(num) ? '' : (num * exchangeRate).toFixed(0));
  };

  const updateTwd = (val: string) => {
    setTwdAmount(val);
    const num = parseFloat(val);
    setJpyAmount(isNaN(num) ? '' : (num / exchangeRate).toFixed(0));
  };

  const fetchLiveRate = async () => {
    setIsUpdatingRate(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "目前的日幣(JPY)兌台幣(TWD)匯率是多少？請只回傳數字，例如 0.215",
        config: { tools: [{ googleSearch: {} }] }
      });
      const rate = parseFloat(response.text?.trim() || '0.215');
      if (!isNaN(rate)) {
        setExchangeRate(rate);
        setLastUpdated(new Date().toLocaleTimeString());
        const val = parseFloat(jpyAmount) * rate;
        setTwdAmount(isNaN(val) ? '' : val.toFixed(0));
      }
    } catch (e) {
      console.error("Rate update failed");
    } finally {
      setIsUpdatingRate(false);
    }
  };

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const executeToolCall = useCallback((call: any) => {
    const { name, args } = call;
    setDays(prevDays => {
      const updatedDays = [...prevDays];
      const dayIdx = args.dayIndex ?? selectedDayIndex;
      if (!updatedDays[dayIdx]) return prevDays;

      if (name === 'add_itinerary_item') {
        updatedDays[dayIdx].itinerary.push({ 
          id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
          ...args
        });
      } else if (name === 'update_itinerary_item') {
        updatedDays[dayIdx].itinerary = updatedDays[dayIdx].itinerary.map(it => 
          it.id === args.itemId ? { ...it, ...args.updates } : it
        );
      } else if (name === 'delete_itinerary_item') {
        updatedDays[dayIdx].itinerary = updatedDays[dayIdx].itinerary.filter(it => it.id !== args.itemId);
      }
      updatedDays[dayIdx].itinerary.sort((a, b) => a.startTime.localeCompare(b.startTime));
      return updatedDays;
    });
    return { status: "success" };
  }, [selectedDayIndex]);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isTyping) return;
    const userMsg = chatInput.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setIsTyping(true);

    try {
      const history = [...messages, { role: 'user', text: userMsg }].map(m => ({ role: m.role, parts: [{ text: m.text }] }));
      const response = await getChatResponse(history, days);
      if (response.functionCalls) {
        for (const call of response.functionCalls) executeToolCall(call);
        setMessages(prev => [...prev, { role: 'model', text: '好的，我已經幫您處理好行程了。' }]);
      } else {
        setMessages(prev => [...prev, { role: 'model', text: response.text || '收到！還有什麼我能幫您的嗎？' }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: '抱歉，剛才連線有點問題。' }]);
    } finally { setIsTyping(false); }
  };

  const startOptimization = async (scope: 'today' | 'all') => {
    setIsOptimizing(true);
    try {
      const itemsToOptimize = scope === 'today' ? days[selectedDayIndex].itinerary : days.flatMap(d => d.itinerary);
      const result = await optimizeFullDayItinerary(itemsToOptimize);
      if (result && result.optimizedItems) {
        const previewItems = itemsToOptimize.map(original => {
          const optimized = result.optimizedItems.find((o: any) => o.id === original.id);
          return optimized ? { ...original, ...optimized } : original;
        }).sort((a, b) => a.startTime.localeCompare(b.startTime));
        setOptimizationPreview({ reasoning: result.reasoning, items: previewItems });
      }
    } catch (error) { alert("優化失敗"); } finally { setIsOptimizing(false); }
  };

  const saveItem = () => {
    const updatedDays = [...days];
    const currentDay = updatedDays[selectedDayIndex];
    if (editingItem) {
      currentDay.itinerary = currentDay.itinerary.map(it => it.id === editingItem.id ? { ...it, ...formData } as ItineraryItem : it);
    } else {
      currentDay.itinerary.push({ ...formData, id: Date.now().toString(), category: formData.category || '其他' } as ItineraryItem);
    }
    currentDay.itinerary.sort((a, b) => a.startTime.localeCompare(b.startTime));
    setDays(updatedDays);
    setIsModalOpen(false);
  };

  const deleteItem = () => {
    if (!editingItem) return;
    const updatedDays = [...days];
    updatedDays[selectedDayIndex].itinerary = updatedDays[selectedDayIndex].itinerary.filter(it => it.id !== editingItem.id);
    setDays(updatedDays);
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full sm:max-w-md sm:mx-auto bg-white shadow-2xl relative overflow-hidden font-sans">
      <Header currentTab={currentTab} setTab={setCurrentTab} />

      <main className="flex-1 overflow-y-auto relative bg-slate-50/50 no-scrollbar pb-[env(safe-area-inset-bottom)] z-0">
        {/* 地圖視圖 */}
        <div className={`absolute inset-0 transition-opacity pointer-events-none ${currentTab === 'map' ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0'}`}>
           <MapComponent itinerary={days[selectedDayIndex].itinerary} isVisible={currentTab === 'map'} onSelectItem={setSelectedMapItem} selectedItemId={selectedMapItem?.id || null} />
           <div className="absolute top-12 left-4 right-4 z-20 flex space-x-2 overflow-x-auto no-scrollbar pb-2">
             {days.map((day, idx) => (
               <button key={idx} onClick={() => { setSelectedDayIndex(idx); setSelectedMapItem(null); }} className={`px-4 py-2 rounded-full whitespace-nowrap text-[10px] font-bold shadow-md transition-all ${selectedDayIndex === idx ? 'bg-primary text-white scale-105' : 'bg-white/90 text-slate-500'}`}>Day {idx + 1}</button>
             ))}
           </div>
           {selectedMapItem && (
             <div className="absolute bottom-10 left-4 right-4 z-[80] animate-pop-in">
               <div className="bg-white rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-slate-100 flex flex-col space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl ${CATEGORY_STYLES[selectedMapItem.category]?.color || 'bg-slate-400'}`}>
                        <i className={CATEGORY_STYLES[selectedMapItem.category]?.icon}></i>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 leading-tight">{selectedMapItem.name}</h4>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded uppercase">{selectedMapItem.startTime}</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => setSelectedMapItem(null)} className="w-8 h-8 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center active:bg-slate-100"><i className="fa-solid fa-xmark"></i></button>
                  </div>
                  <button onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedMapItem.lat},${selectedMapItem.lng}&travelmode=transit`, '_blank')} className="w-full bg-primary text-white py-3.5 rounded-2xl font-bold flex items-center justify-center space-x-2 active:scale-95 transition-all shadow-lg shadow-primary/20">
                    <i className="fa-solid fa-location-arrow text-sm"></i><span>開始導航</span>
                  </button>
               </div>
             </div>
           )}
        </div>

        {/* 行程列表 */}
        <div className={currentTab === 'itinerary' ? 'block p-6 mt-6' : 'hidden'}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex space-x-3 overflow-x-auto no-scrollbar flex-1 mr-4">
              {days.map((day, index) => (
                <button key={index} onClick={() => setSelectedDayIndex(index)} className={`flex flex-col items-center justify-center min-w-[64px] h-[76px] rounded-2xl border transition-all ${selectedDayIndex === index ? 'bg-primary text-white border-primary scale-105 shadow-md' : 'bg-white text-slate-400'}`}>
                  <span className="text-[10px] font-bold uppercase mb-0.5">{day.weekday}</span>
                  <span className="text-2xl font-bold font-display">{day.date}</span>
                </button>
              ))}
            </div>
            <button onClick={() => startOptimization('today')} disabled={isOptimizing} className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-all ${isOptimizing ? 'bg-slate-100 text-slate-300 animate-pulse' : 'bg-highlight text-white active:scale-90'}`}>
              {isOptimizing ? <i className="fa-solid fa-wand-sparkles animate-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
            </button>
          </div>
          <div className="pb-24">
            {days[selectedDayIndex].itinerary.map((item, index) => (
              <ItineraryCard key={item.id} item={item} isFirst={index === 0} onEdit={(it) => { setEditingItem(it); setFormData(it); setIsModalOpen(true); }} />
            ))}
          </div>
        </div>

        {/* 匯率換算器 */}
        {currentTab === 'currency' && (
          <div className="p-6 animate-fade-in mt-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800 font-display uppercase tracking-tight">Currency Converter</h2>
              <button onClick={fetchLiveRate} disabled={isUpdatingRate} className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border border-slate-200 bg-white shadow-sm flex items-center space-x-1 ${isUpdatingRate ? 'opacity-50' : 'active:bg-slate-50'}`}>
                <i className={`fa-solid fa-rotate ${isUpdatingRate ? 'animate-spin' : ''}`}></i>
                <span>更新匯率</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-full -mr-12 -mt-12 z-0"></div>
                <div className="relative z-10 space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 flex justify-between">
                      <span>日幣 JPY (¥)</span>
                      <span className="text-primary tracking-normal font-sans">1 JPY = {exchangeRate} TWD</span>
                    </label>
                    <div className="flex items-center space-x-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 focus-within:border-blue-300 transition-colors">
                      <span className="text-2xl font-bold text-slate-400 font-display">¥</span>
                      <input type="number" value={jpyAmount} onChange={(e) => updateJpy(e.target.value)} className="bg-transparent text-2xl font-bold w-full outline-none text-slate-700" placeholder="0" />
                    </div>
                  </div>

                  <div className="flex justify-center -my-2 relative z-20">
                    <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                      <i className="fa-solid fa-right-left rotate-90 text-xs"></i>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">台幣 TWD ($)</label>
                    <div className="flex items-center space-x-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 focus-within:border-blue-300 transition-colors">
                      <span className="text-2xl font-bold text-slate-400 font-display">$</span>
                      <input type="number" value={twdAmount} onChange={(e) => updateTwd(e.target.value)} className="bg-transparent text-2xl font-bold w-full outline-none text-slate-700" placeholder="0" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {['100', '500', '1000', '3000', '5000', '10000', '30000', '50000'].map(val => (
                  <button key={val} onClick={() => updateJpy(val)} className="bg-white border border-slate-100 py-3 rounded-xl text-xs font-bold text-slate-500 shadow-sm active:bg-blue-50 active:text-primary transition-all">¥{parseInt(val).toLocaleString()}</button>
                ))}
              </div>

              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex items-start space-x-3">
                <i className="fa-solid fa-circle-info text-amber-500 mt-0.5"></i>
                <div className="text-[11px] text-amber-700 leading-relaxed font-medium">
                  <p>最後更新：{lastUpdated}</p>
                  <p>提示：日韓匯率波動較大，換算結果僅供參考。在藥妝店購買滿 ¥5,000 (不含稅) 即可辦理免稅退 10% 喔！</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI 助理 */}
        {currentTab === 'chat' && (
          <div className="flex flex-col h-full animate-fade-in bg-white mt-6">
            <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[88%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-slate-50 text-slate-700 border border-slate-100 rounded-tl-none'}`}>
                    {msg.text || <i className="fa-solid fa-spinner fa-spin opacity-50"></i>}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="p-4 bg-white border-t pb-[calc(1.2rem+env(safe-area-inset-bottom))]">
              <div className="flex items-center space-x-2 bg-slate-100 rounded-2xl p-2 border border-slate-200">
                <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="試試：幫我更新晚餐的營業時間..." className="flex-1 bg-transparent px-3 py-2 outline-none text-sm" />
                <button onClick={handleSendMessage} disabled={isTyping || !chatInput.trim()} className={`w-10 h-10 rounded-xl flex items-center justify-center ${chatInput.trim() ? 'bg-primary text-white' : 'bg-slate-300 text-slate-400'}`}>
                  {isTyping ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 優化預覽/新增行程 Modal 略 (保持原樣) */}
      <style>{`
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        .animate-pop-in { animation: pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pop-in { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
