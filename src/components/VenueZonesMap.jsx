import { useMemo } from 'react'
import { formatCurrency } from '../utils/currency'
import { FaInfoCircle, FaArrowRight } from 'react-icons/fa'

// Преопределенные цвета для разных типов зон
const ZONE_COLORS = {
  'VIP': '#d97706',
  'VIP1': '#d97706',
  'VIP2': '#d97706',
  'FAN': '#ec4899',
  'ФАН': '#ec4899',
  'STANDING': '#ef4444',
  'ТАНЦЕВАЛЬНЫЙ': '#06b6d4',
  'TRIBUNE': '#3b82f6',
  'BALCONY': '#8b5cf6',
  'CHEAP_SEATS': '#10b981',
  'A': '#16a34a',
  'B': '#2563eb',
  'C': '#6366f1',
  'ЛОЖА': '#f59e0b'
}

const ZONE_NAMES = {
  'VIP': 'VIP',
  'VIP1': 'VIP 1',
  'VIP2': 'VIP 2',
  'FAN': 'Фан Зона',
  'ФАН': 'Фан Зона',
  'STANDING': 'Standing',
  'ТАНЦЕВАЛЬНЫЙ': 'Танцевальный Партер',
  'TRIBUNE': 'Tribune',
  'BALCONY': 'Balcony',
  'CHEAP_SEATS': 'Cheap Seats',
  'A': 'Zone A',
  'B': 'Zone B',
  'C': 'Zone C',
  'ЛОЖА': 'Ложа'
}

export default function VenueZonesMap({ seats, zones, onZoneSelect }) {
  // Группируем места по зонам
  const zonesMap = useMemo(() => {
    const map = new Map()
    
    seats.forEach(seat => {
      const zoneCode = seat.zone
      if (!zoneCode) return
      
      if (!map.has(zoneCode)) {
        const zoneInfo = zones.find(z => z.code === zoneCode) || {}
        map.set(zoneCode, {
          code: zoneCode,
          name: zoneInfo.name || ZONE_NAMES[zoneCode] || zoneCode,
          color: zoneInfo.color || ZONE_COLORS[zoneCode] || '#999999',
          minPrice: zoneInfo.minPrice || 0,
          maxPrice: zoneInfo.maxPrice || 0,
          seats: [],
          availableCount: 0,
          totalCount: 0,
          rows: new Set(),
          cols: new Set()
        })
      }
      
      const zone = map.get(zoneCode)
      zone.seats.push(seat)
      zone.totalCount++
      zone.rows.add(seat.row)
      zone.cols.add(seat.seat)
      
      if (seat.status === 'available') {
        zone.availableCount++
      }
    })
    
    return Array.from(map.values())
  }, [seats, zones])

  // Определяем тип каждой зоны
  const zonesLayout = useMemo(() => {
    return zonesMap.map(zone => {
      const rows = Array.from(zone.rows).sort((a, b) => a - b)
      const cols = Array.from(zone.cols).sort((a, b) => a - b)
      
      const isFan = zone.code.toUpperCase().includes('ФАН') || zone.code.toUpperCase().includes('FAN')
      const isDance = zone.code.toUpperCase().includes('ТАНЦЕВАЛЬНЫЙ') || zone.code.toUpperCase().includes('DANCE')
      const isVip = zone.code.toUpperCase().includes('VIP')
      const isStanding = isFan || isDance || zone.code.toUpperCase().includes('STANDING')
      const isBox = zone.code.toUpperCase().includes('ЛОЖА') || zone.code.toUpperCase().includes('BOX')
      
      // Определяем категорию секции
      let category = 'other'
      if (isStanding) category = 'standing'
      else if (isVip) category = 'vip'
      else if (zone.code.match(/^C/i)) category = 'c'
      else if (zone.code.match(/^A/i) && !isBox) category = 'a'
      else if (zone.code.match(/^B/i)) category = 'b'
      else if (isBox) category = 'box'
      
      return {
        ...zone,
        minRow: Math.min(...rows),
        maxRow: Math.max(...rows),
        minCol: Math.min(...cols),
        maxCol: Math.max(...cols),
        rowCount: rows.length,
        colCount: cols.length,
        isFan,
        isDance,
        isVip,
        isStanding,
        isBox,
        category
      }
    })
  }, [zonesMap])

  // Группируем зоны по категориям
  const groupedZones = useMemo(() => {
    const groups = {
      standing: zonesLayout.filter(z => z.category === 'standing'),
      vip: zonesLayout.filter(z => z.category === 'vip'),
      c: zonesLayout.filter(z => z.category === 'c').sort((a, b) => {
        const aNum = parseInt(a.code.match(/\d+/)?.[0] || '0')
        const bNum = parseInt(b.code.match(/\d+/)?.[0] || '0')
        return aNum - bNum
      }),
      a: zonesLayout.filter(z => z.category === 'a').sort((a, b) => {
        const aNum = parseInt(a.code.match(/\d+/)?.[0] || '0')
        const bNum = parseInt(b.code.match(/\d+/)?.[0] || '0')
        return aNum - bNum
      }),
      box: zonesLayout.filter(z => z.category === 'box'),
      b: zonesLayout.filter(z => z.category === 'b').sort((a, b) => {
        const aNum = parseInt(b.code.match(/\d+/)?.[0] || '0')
        const bNum = parseInt(b.code.match(/\d+/)?.[0] || '0')
        return aNum - bNum
      }),
      other: zonesLayout.filter(z => z.category === 'other')
    }
    return groups
  }, [zonesLayout])

  // Компонент карточки зоны
  const ZoneCard = ({ zone, size = 'normal' }) => {
    const isLarge = size === 'large'
    const isMedium = size === 'medium'
    
    return (
      <button
        onClick={() => onZoneSelect(zone.code)}
        className={`
          group relative rounded-xl border-2 transition-all cursor-pointer
          hover:scale-105 hover:shadow-2xl hover:z-20
          ${isLarge ? 'p-8' : isMedium ? 'p-6' : 'p-4'}
        `}
        style={{
          backgroundColor: `${zone.color}20`,
          borderColor: zone.color
        }}
      >
        <div 
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
          style={{
            background: `linear-gradient(135deg, ${zone.color}30, ${zone.color}50)`
          }}
        />
        
        <div className="relative z-10 text-center">
          <div className={`
            font-bold text-white mb-2
            ${isLarge ? 'text-2xl' : isMedium ? 'text-xl' : 'text-lg'}
          `}>
            {zone.name}
          </div>
          
          <div className={`
            mb-3
            ${isLarge ? 'text-base' : isMedium ? 'text-sm' : 'text-xs'}
            text-neutral-300
          `}>
            {zone.isStanding ? 'Стоячие места' : `${zone.rowCount} рядов · ${zone.colCount} мест`}
          </div>
          
          {zone.minPrice > 0 && (
            <div className={`
              font-semibold mb-2
              ${isLarge ? 'text-lg' : isMedium ? 'text-base' : 'text-sm'}
            `}
            style={{ color: zone.color }}
            >
              {zone.minPrice === zone.maxPrice
                ? formatCurrency(zone.minPrice)
                : `${formatCurrency(zone.minPrice)} - ${formatCurrency(zone.maxPrice)}`
              }
            </div>
          )}
          
          <div className={`
            flex items-center justify-center gap-2
            ${isLarge ? 'text-sm' : 'text-xs'}
            text-neutral-400
          `}>
            <span className={`w-2 h-2 rounded-full ${zone.availableCount > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>Доступно: {zone.availableCount} из {zone.totalCount}</span>
          </div>
          
          <div className={`
            mt-3 text-brand-400 font-medium group-hover:text-brand-300 transition
            ${isLarge ? 'text-base' : 'text-sm'}
            flex items-center justify-center gap-2
          `}>
            Выбрать места <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </button>
    )
  }

  return (
    <div className="space-y-8">
      {/* Сцена */}
      <div className="text-center relative">
        <div className="inline-block px-24 py-8 bg-gradient-to-b from-yellow-600 via-yellow-700 to-yellow-800 border-4 border-yellow-500 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          <div className="relative text-3xl font-black text-white tracking-widest drop-shadow-lg">
            🎤 СЦЕНА 🎤
          </div>
        </div>
        <div className="mt-4 text-sm text-neutral-500 flex items-center justify-center gap-8">
          <span>← Вход 1</span>
          <span className="w-1 h-1 rounded-full bg-neutral-600" />
          <span>Вход 2 →</span>
        </div>
      </div>

      {/* Схема зала - структурированное отображение */}
      <div className="space-y-6">
        {/* Стоячие зоны - перед сценой */}
        {groupedZones.standing.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-neutral-300 flex items-center gap-2">
              <div className="w-1 h-6 rounded-full bg-brand-500" />
              Стоячие зоны
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groupedZones.standing.map(zone => (
                <ZoneCard key={zone.code} zone={zone} size="large" />
              ))}
            </div>
          </div>
        )}

        {/* VIP секции */}
        {groupedZones.vip.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-neutral-300 flex items-center gap-2">
              <div className="w-1 h-6 rounded-full bg-orange-500" />
              VIP секции
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groupedZones.vip.map(zone => (
                <ZoneCard key={zone.code} zone={zone} size="medium" />
              ))}
            </div>
          </div>
        )}

        {/* Секции C - ближайшие к сцене */}
        {groupedZones.c.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-neutral-300 flex items-center gap-2">
              <div className="w-1 h-6 rounded-full" style={{ backgroundColor: ZONE_COLORS.C }} />
              Секции C (ближайшие к сцене)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {groupedZones.c.map(zone => (
                <ZoneCard key={zone.code} zone={zone} size="normal" />
              ))}
            </div>
          </div>
        )}

        {/* Секции A - средний уровень */}
        {groupedZones.a.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-neutral-300 flex items-center gap-2">
              <div className="w-1 h-6 rounded-full" style={{ backgroundColor: ZONE_COLORS.A }} />
              Секции A (средний уровень)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {groupedZones.a.map(zone => (
                <ZoneCard key={zone.code} zone={zone} size="normal" />
              ))}
            </div>
          </div>
        )}

        {/* Ложи */}
        {groupedZones.box.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-neutral-300 flex items-center gap-2">
              <div className="w-1 h-6 rounded-full" style={{ backgroundColor: ZONE_COLORS.ЛОЖА }} />
              Ложи
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {groupedZones.box.map(zone => (
                <ZoneCard key={zone.code} zone={zone} size="medium" />
              ))}
            </div>
          </div>
        )}

        {/* Секции B - дальние */}
        {groupedZones.b.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-neutral-300 flex items-center gap-2">
              <div className="w-1 h-6 rounded-full" style={{ backgroundColor: ZONE_COLORS.B }} />
              Секции B (дальние)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {groupedZones.b.map(zone => (
                <ZoneCard key={zone.code} zone={zone} size="normal" />
              ))}
            </div>
          </div>
        )}

        {/* Другие зоны */}
        {groupedZones.other.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-neutral-300 flex items-center gap-2">
              <div className="w-1 h-6 rounded-full bg-neutral-500" />
              Другие зоны
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {groupedZones.other.map(zone => (
                <ZoneCard key={zone.code} zone={zone} size="normal" />
              ))}
            </div>
          </div>
        )}

        {/* Кнопка "Показать все места" */}
        <div className="pt-6 border-t-2 border-neutral-800">
          <button
            onClick={() => onZoneSelect(null)}
            className="w-full p-8 rounded-2xl border-2 border-brand-500/50 bg-gradient-to-r from-brand-500/10 to-pink-500/10 hover:from-brand-500/20 hover:to-pink-500/20 transition-all group"
          >
            <div className="flex items-center justify-center gap-4">
              <FaInfoCircle className="text-brand-400 text-2xl" />
              <div className="text-left">
                <div className="font-bold text-xl text-white group-hover:text-brand-300 transition">
                  Показать все места сразу
                </div>
                <p className="text-sm text-neutral-400 mt-1">
                  Открыть детальную схему со всеми зонами одновременно
                </p>
              </div>
              <FaArrowRight className="text-brand-400 text-xl group-hover:translate-x-2 transition-transform" />
            </div>
          </button>
        </div>
      </div>

      {/* Легенда */}
      <div className="card p-6">
        <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
          <FaInfoCircle className="text-brand-400" />
          Легенда зон
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {zonesLayout.map(zone => (
            <div
              key={zone.code}
              className="flex items-center gap-3 p-4 rounded-lg bg-neutral-900/50 border border-neutral-800 hover:border-brand-500/50 hover:bg-neutral-900 transition cursor-pointer"
              onClick={() => onZoneSelect(zone.code)}
            >
              <div
                className="w-10 h-10 rounded-lg border-2 flex-shrink-0 flex items-center justify-center font-bold text-sm shadow-lg"
                style={{
                  backgroundColor: `${zone.color}90`,
                  borderColor: zone.color,
                  color: 'white'
                }}
              >
                {zone.code.length > 4 ? zone.code.substring(0, 3) : zone.code}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-neutral-200">{zone.name}</div>
                {zone.minPrice > 0 && (
                  <div className="text-sm text-neutral-400 mt-1">
                    {zone.minPrice === zone.maxPrice
                      ? formatCurrency(zone.minPrice)
                      : `${formatCurrency(zone.minPrice)} - ${formatCurrency(zone.maxPrice)}`
                    }
                  </div>
                )}
                <div className="text-xs text-neutral-500 mt-1 flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${zone.availableCount > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span>{zone.availableCount} из {zone.totalCount} доступно</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
