import { useMemo, useState } from 'react'
import { formatCurrency } from '../utils/currency'
import { FaInfoCircle, FaFilter, FaTimes } from 'react-icons/fa'

// Цвета зон
const ZONE_COLORS = {
  'VIP': '#d97706',
  'VIP1': '#d97706',
  'VIP2': '#d97706',
  'FAN': '#ec4899',
  'ФАН': '#ec4899',
  'STANDING': '#ef4444',
  'ТАНЦЕВАЛЬНЫЙ': '#3b82f6',
  'TRIBUNE': '#3b82f6',
  'BALCONY': '#8b5cf6',
  'CHEAP_SEATS': '#10b981',
  'A': '#6b7280',
  'B': '#6b7280',
  'C': '#6b7280',
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
  const [priceFilter, setPriceFilter] = useState(null)
  const [onlyAvailable, setOnlyAvailable] = useState(false)
  const [closerToStage, setCloserToStage] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

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

  // Определяем тип и позицию каждой зоны
  const zonesLayout = useMemo(() => {
    return zonesMap.map(zone => {
      const rows = Array.from(zone.rows).sort((a, b) => a - b)
      const cols = Array.from(zone.cols).sort((a, b) => a - b)
      
      const isFan = zone.code.toUpperCase().includes('ФАН') || zone.code.toUpperCase().includes('FAN')
      const isDance = zone.code.toUpperCase().includes('ТАНЦЕВАЛЬНЫЙ') || zone.code.toUpperCase().includes('DANCE')
      const isVip = zone.code.toUpperCase().includes('VIP')
      const isStanding = isFan || isDance || zone.code.toUpperCase().includes('STANDING')
      const isBox = zone.code.toUpperCase().includes('ЛОЖА') || zone.code.toUpperCase().includes('BOX')
      
      // Определяем категорию
      let category = 'other'
      if (isStanding) category = 'standing'
      else if (isVip) category = 'vip'
      else if (zone.code.match(/^C/i)) category = 'c'
      else if (zone.code.match(/^A/i) && !isBox) category = 'a'
      else if (zone.code.match(/^B/i)) category = 'b'
      else if (isBox) category = 'box'
      
      // Средняя позиция для определения близости к сцене
      const avgRow = rows.reduce((a, b) => a + b, 0) / rows.length
      
      return {
        ...zone,
        minRow: Math.min(...rows),
        maxRow: Math.max(...rows),
        minCol: Math.min(...cols),
        maxCol: Math.max(...cols),
        rowCount: rows.length,
        colCount: cols.length,
        avgRow,
        isFan,
        isDance,
        isVip,
        isStanding,
        isBox,
        category
      }
    })
  }, [zonesMap])

  // Фильтрация зон
  const filteredZones = useMemo(() => {
    return zonesLayout.filter(zone => {
      if (priceFilter && zone.minPrice > priceFilter) return false
      if (onlyAvailable && zone.availableCount === 0) return false
      if (closerToStage && zone.avgRow > 10) return false
      return true
    })
  }, [zonesLayout, priceFilter, onlyAvailable, closerToStage])

  // Группируем зоны
  const groupedZones = useMemo(() => {
    const groups = {
      fan: filteredZones.find(z => z.isFan),
      dance: filteredZones.find(z => z.isDance),
      vip: filteredZones.filter(z => z.isVip).sort((a, b) => a.code.localeCompare(b.code)),
      c: filteredZones.filter(z => z.category === 'c').sort((a, b) => {
        const aNum = parseInt(a.code.match(/\d+/)?.[0] || '0')
        const bNum = parseInt(b.code.match(/\d+/)?.[0] || '0')
        return aNum - bNum
      }),
      a: filteredZones.filter(z => z.category === 'a').sort((a, b) => {
        const aNum = parseInt(a.code.match(/\d+/)?.[0] || '0')
        const bNum = parseInt(b.code.match(/\d+/)?.[0] || '0')
        return aNum - bNum
      }),
      b: filteredZones.filter(z => z.category === 'b').sort((a, b) => {
        const aNum = parseInt(a.code.match(/\d+/)?.[0] || '0')
        const bNum = parseInt(b.code.match(/\d+/)?.[0] || '0')
        return aNum - bNum
      })
    }
    return groups
  }, [filteredZones])

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Основная схема зала */}
      <div className="flex-1 space-y-6">
        {/* Сцена */}
        <div className="text-center relative">
          <div className="inline-block px-24 py-8 bg-gradient-to-b from-neutral-900 via-black to-neutral-900 border-4 border-neutral-700 rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
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

        {/* Визуальная схема зала */}
        <div className="relative bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 rounded-2xl border-2 border-neutral-800 p-8 min-h-[600px]">
          <div className="relative w-full" style={{ minHeight: '500px' }}>
            {/* Фан зона - полукруглая перед сценой */}
            {groupedZones.fan && (
              <button
                onClick={() => onZoneSelect(groupedZones.fan.code)}
                className="group absolute bottom-8 left-1/2 transform -translate-x-1/2 rounded-full border-4 transition-all hover:scale-110 hover:shadow-2xl cursor-pointer z-30"
                style={{
                  width: '280px',
                  height: '140px',
                  backgroundColor: `${groupedZones.fan.color}25`,
                  borderColor: groupedZones.fan.color,
                  clipPath: 'ellipse(50% 50% at 50% 100%)'
                }}
              >
                <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-pink-500/40 to-purple-500/40" />
                <div className="relative z-10 h-full flex flex-col items-center justify-center p-4">
                  <div className="text-xl font-bold text-white mb-1">{groupedZones.fan.name}</div>
                  <div className="text-xs text-neutral-300 text-center">
                    {groupedZones.fan.availableCount} из {groupedZones.fan.totalCount}
                    {groupedZones.fan.minPrice > 0 && ` · от ${formatCurrency(groupedZones.fan.minPrice)}`}
                  </div>
                </div>
              </button>
            )}

            {/* Танцевальный партер - между VIP и Fan зоной */}
            {groupedZones.dance && (
              <button
                onClick={() => onZoneSelect(groupedZones.dance.code)}
                className="group absolute bottom-32 left-1/2 transform -translate-x-1/2 rounded-2xl border-4 transition-all hover:scale-105 hover:shadow-2xl cursor-pointer z-25"
                style={{
                  width: '85%',
                  height: '100px',
                  backgroundColor: `${groupedZones.dance.color}25`,
                  borderColor: groupedZones.dance.color,
                  borderStyle: 'dashed'
                }}
              >
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-blue-500/40 to-cyan-500/40" />
                <div className="relative z-10 h-full flex flex-col items-center justify-center p-4">
                  <div className="text-lg font-bold text-white mb-1">{groupedZones.dance.name}</div>
                  <div className="text-xs text-neutral-300 text-center">
                    Стоячие места · {groupedZones.dance.availableCount} из {groupedZones.dance.totalCount}
                    {groupedZones.dance.minPrice > 0 && ` · от ${formatCurrency(groupedZones.dance.minPrice)}`}
                  </div>
                </div>
              </button>
            )}

            {/* VIP 1 и VIP 2 - прямоугольные перед сценой */}
            {groupedZones.vip.map((zone, idx) => (
              <button
                key={zone.code}
                onClick={() => onZoneSelect(zone.code)}
                className="group absolute rounded-xl border-4 transition-all hover:scale-110 hover:shadow-2xl cursor-pointer z-20"
                style={{
                  width: '38%',
                  height: '90px',
                  bottom: '180px',
                  left: idx === 0 ? '8%' : '54%',
                  backgroundColor: `${zone.color}30`,
                  borderColor: zone.color
                }}
              >
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-orange-500/40 to-yellow-500/40" />
                <div className="relative z-10 h-full flex flex-col items-center justify-center p-3">
                  <div className="text-lg font-bold text-white">{zone.name}</div>
                  <div className="text-xs text-neutral-300 mt-1">
                    {zone.availableCount}/{zone.totalCount}
                    {zone.minPrice > 0 && ` · ${formatCurrency(zone.minPrice)}`}
                  </div>
                </div>
              </button>
            ))}

            {/* Секторы C - центральные с рядами */}
            <div className="absolute bottom-64 left-0 right-0 flex justify-center gap-2 flex-wrap z-10">
              {groupedZones.c.map((zone, idx) => {
                const totalC = groupedZones.c.length
                const angle = ((idx - totalC / 2) / totalC) * 60 // Распределяем по дуге
                const offsetX = Math.sin(angle * Math.PI / 180) * 120
                
                return (
                  <button
                    key={zone.code}
                    onClick={() => onZoneSelect(zone.code)}
                    className="group relative rounded-lg border-2 transition-all hover:scale-125 hover:shadow-xl cursor-pointer"
                    style={{
                      width: '100px',
                      height: '80px',
                      backgroundColor: `${zone.color}25`,
                      borderColor: zone.color,
                      transform: `translateX(${offsetX}px)`
                    }}
                  >
                    <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: `linear-gradient(135deg, ${zone.color}40, ${zone.color}60)` }}
                    />
                    <div className="relative z-10 h-full flex flex-col items-center justify-center p-2">
                      <div className="font-bold text-white text-sm">{zone.code}</div>
                      <div className="text-[10px] text-neutral-300 mt-1">
                        {zone.totalCount} мест
                        {zone.minPrice > 0 && ` · ${formatCurrency(zone.minPrice)}`}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Секторы A - верхние по дуге */}
            <div className="absolute bottom-96 left-0 right-0 flex justify-center gap-2 flex-wrap z-10">
              {groupedZones.a.map((zone, idx) => {
                const totalA = groupedZones.a.length
                const angle = ((idx - totalA / 2) / totalA) * 80
                const offsetX = Math.sin(angle * Math.PI / 180) * 180
                
                return (
                  <button
                    key={zone.code}
                    onClick={() => onZoneSelect(zone.code)}
                    className="group relative rounded-lg border-2 transition-all hover:scale-125 hover:shadow-xl cursor-pointer"
                    style={{
                      width: '90px',
                      height: '70px',
                      backgroundColor: `${zone.color}25`,
                      borderColor: zone.color,
                      transform: `translateX(${offsetX}px)`
                    }}
                  >
                    <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: `linear-gradient(135deg, ${zone.color}40, ${zone.color}60)` }}
                    />
                    <div className="relative z-10 h-full flex flex-col items-center justify-center p-2">
                      <div className="font-bold text-white text-xs">{zone.code}</div>
                      <div className="text-[9px] text-neutral-300 mt-0.5">
                        {zone.totalCount}
                        {zone.minPrice > 0 && ` · ${formatCurrency(zone.minPrice)}`}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Секторы B - верхние по дуге */}
            <div className="absolute bottom-[28rem] left-0 right-0 flex justify-center gap-2 flex-wrap z-10">
              {groupedZones.b.map((zone, idx) => {
                const totalB = groupedZones.b.length
                const angle = ((idx - totalB / 2) / totalB) * 100
                const offsetX = Math.sin(angle * Math.PI / 180) * 220
                
                return (
                  <button
                    key={zone.code}
                    onClick={() => onZoneSelect(zone.code)}
                    className="group relative rounded-lg border-2 transition-all hover:scale-125 hover:shadow-xl cursor-pointer"
                    style={{
                      width: '85px',
                      height: '65px',
                      backgroundColor: `${zone.color}25`,
                      borderColor: zone.color,
                      transform: `translateX(${offsetX}px)`
                    }}
                  >
                    <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: `linear-gradient(135deg, ${zone.color}40, ${zone.color}60)` }}
                    />
                    <div className="relative z-10 h-full flex flex-col items-center justify-center p-2">
                      <div className="font-bold text-white text-xs">{zone.code}</div>
                      <div className="text-[9px] text-neutral-300 mt-0.5">
                        {zone.totalCount}
                        {zone.minPrice > 0 && ` · ${formatCurrency(zone.minPrice)}`}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Кнопка "Показать все места" */}
          <div className="mt-8 pt-6 border-t-2 border-neutral-800">
            <button
              onClick={() => onZoneSelect(null)}
              className="w-full p-6 rounded-xl border-2 border-brand-500/50 bg-brand-500/10 hover:bg-brand-500/20 transition-all group"
            >
              <div className="flex items-center justify-center gap-3">
                <FaInfoCircle className="text-brand-400 text-xl" />
                <span className="font-bold text-lg text-white group-hover:text-brand-300 transition">
                  Показать все места сразу
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Боковая панель - Фильтры и Легенда */}
      <div className="w-full lg:w-80 space-y-4">
        {/* Панель фильтров */}
        <div className="card p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <FaFilter className="text-brand-400" />
              Фильтры
            </h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden p-2 rounded-lg hover:bg-neutral-800"
            >
              {showFilters ? <FaTimes /> : <FaFilter />}
            </button>
          </div>

          <div className={`space-y-4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            {/* Фильтр по цене */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Цена до
              </label>
              <input
                type="number"
                value={priceFilter || ''}
                onChange={(e) => setPriceFilter(e.target.value ? Number(e.target.value) : null)}
                placeholder="Любая"
                className="input w-full"
              />
            </div>

            {/* Только доступные */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="onlyAvailable"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-700 bg-neutral-800"
              />
              <label htmlFor="onlyAvailable" className="text-sm text-neutral-300 cursor-pointer">
                Только свободные места
              </label>
            </div>

            {/* Ближе к сцене */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="closerToStage"
                checked={closerToStage}
                onChange={(e) => setCloserToStage(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-700 bg-neutral-800"
              />
              <label htmlFor="closerToStage" className="text-sm text-neutral-300 cursor-pointer">
                Ближе к сцене
              </label>
            </div>

            {/* Сброс фильтров */}
            {(priceFilter || onlyAvailable || closerToStage) && (
              <button
                onClick={() => {
                  setPriceFilter(null)
                  setOnlyAvailable(false)
                  setCloserToStage(false)
                }}
                className="w-full text-sm text-brand-400 hover:text-brand-300"
              >
                Сбросить фильтры
              </button>
            )}
          </div>
        </div>

        {/* Легенда */}
        <div className="card p-4 space-y-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <FaInfoCircle className="text-brand-400" />
            Легенда
          </h3>
          
          <div className="space-y-3">
            {/* VIP */}
            {groupedZones.vip.length > 0 && (
              <div className="flex items-center gap-3 p-2 rounded-lg bg-neutral-900/50">
                <div
                  className="w-6 h-6 rounded border-2 flex-shrink-0"
                  style={{
                    backgroundColor: `${ZONE_COLORS.VIP}80`,
                    borderColor: ZONE_COLORS.VIP
                  }}
                />
                <div className="flex-1">
                  <div className="font-medium text-sm text-neutral-200">VIP</div>
                  <div className="text-xs text-neutral-400">Золотистый</div>
                </div>
              </div>
            )}

            {/* Фан зона */}
            {groupedZones.fan && (
              <div className="flex items-center gap-3 p-2 rounded-lg bg-neutral-900/50">
                <div
                  className="w-6 h-6 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: `${ZONE_COLORS.ФАН}80`,
                    border: `2px solid ${ZONE_COLORS.ФАН}`
                  }}
                />
                <div className="flex-1">
                  <div className="font-medium text-sm text-neutral-200">Fan Zone</div>
                  <div className="text-xs text-neutral-400">Розовый</div>
                </div>
              </div>
            )}

            {/* Танцевальный партер */}
            {groupedZones.dance && (
              <div className="flex items-center gap-3 p-2 rounded-lg bg-neutral-900/50">
                <div
                  className="w-6 h-6 rounded border-2 border-dashed flex-shrink-0"
                  style={{
                    backgroundColor: `${ZONE_COLORS.ТАНЦЕВАЛЬНЫЙ}80`,
                    borderColor: ZONE_COLORS.ТАНЦЕВАЛЬНЫЙ
                  }}
                />
                <div className="flex-1">
                  <div className="font-medium text-sm text-neutral-200">Dance Floor</div>
                  <div className="text-xs text-neutral-400">Синий</div>
                </div>
              </div>
            )}

            {/* Секторы A/B/C */}
            {(groupedZones.a.length > 0 || groupedZones.b.length > 0 || groupedZones.c.length > 0) && (
              <div className="flex items-center gap-3 p-2 rounded-lg bg-neutral-900/50">
                <div
                  className="w-6 h-6 rounded border-2 flex-shrink-0"
                  style={{
                    backgroundColor: `${ZONE_COLORS.A}80`,
                    borderColor: ZONE_COLORS.A
                  }}
                />
                <div className="flex-1">
                  <div className="font-medium text-sm text-neutral-200">Секторы A/B/C</div>
                  <div className="text-xs text-neutral-400">Серые</div>
                </div>
              </div>
            )}

            {/* Сцена */}
            <div className="flex items-center gap-3 p-2 rounded-lg bg-neutral-900/50">
              <div className="w-6 h-6 rounded border-2 flex-shrink-0 bg-black border-neutral-700" />
              <div className="flex-1">
                <div className="font-medium text-sm text-neutral-200">Сцена</div>
                <div className="text-xs text-neutral-400">Чёрная</div>
              </div>
            </div>
          </div>

          {/* Детальная информация о зонах */}
          <div className="pt-4 border-t border-neutral-800 space-y-2">
            <div className="text-xs font-semibold text-neutral-400 mb-2">Все зоны</div>
            {filteredZones.map(zone => (
              <div
                key={zone.code}
                className="flex items-center gap-2 p-2 rounded-lg bg-neutral-900/30 hover:bg-neutral-900/50 transition cursor-pointer"
                onClick={() => onZoneSelect(zone.code)}
              >
                <div
                  className="w-4 h-4 rounded border flex-shrink-0"
                  style={{
                    backgroundColor: `${zone.color}80`,
                    borderColor: zone.color
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-neutral-200">{zone.name}</div>
                  {zone.minPrice > 0 && (
                    <div className="text-[10px] text-neutral-400">
                      {formatCurrency(zone.minPrice)}
                    </div>
                  )}
                </div>
                <div className="text-[10px] text-neutral-500">
                  {zone.availableCount}/{zone.totalCount}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
