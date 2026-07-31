import React from 'react';
import { ExternalLink, ArrowLeft, CheckCircle } from 'lucide-react';
import { Project, Block } from '../types';

interface PreviewViewProps {
  project: Project | null;
  onBackToEditor: () => void;
}

export const PreviewView: React.FC<PreviewViewProps> = ({ project, onBackToEditor }) => {
  const blocks: Block[] = project?.blocks || [];

  const resolveColorToHex = (colorVal?: string, defaultHex = '#06b6d4'): string => {
    if (!colorVal) return defaultHex;
    if (colorVal.startsWith('#') || colorVal.startsWith('rgb') || colorVal.startsWith('hsl')) {
      return colorVal;
    }
    const colorMap: Record<string, string> = {
      red: '#ef4444',
      rose: '#f43f5e',
      blue: '#3b82f6',
      cyan: '#06b6d4',
      purple: '#a855f7',
      violet: '#8b5cf6',
      green: '#22c55e',
      emerald: '#10b981',
      amber: '#f59e0b',
      orange: '#f97316',
      pink: '#ec4899',
      yellow: '#eab308',
      indigo: '#6366f1',
      teal: '#14b8a6',
      slate: '#64748b'
    };
    return colorMap[colorVal.toLowerCase()] || defaultHex;
  };

  const getBtnStyle = (styles: any) => {
    const pri = styles?.primaryColor || (styles?.accent?.startsWith('#') || styles?.accent?.startsWith('rgb') ? styles?.accent : null);
    const hex = resolveColorToHex(pri, '#06b6d4');
    return { backgroundColor: hex, color: '#ffffff', border: 'none' };
  };

  const getSecondaryBtnStyle = (styles: any) => {
    const sec = styles?.secondaryColor || styles?.primaryColor;
    const hex = resolveColorToHex(sec, '#a855f7');
    return { borderColor: hex, color: hex, backgroundColor: 'transparent' };
  };

  const getAccentTextStyle = (styles: any) => {
    const color = styles?.secondaryColor || styles?.primaryColor;
    const hex = resolveColorToHex(color, '#06b6d4');
    return { color: hex };
  };

  const getAccentBgStyle = (styles: any) => {
    const color = styles?.primaryColor || styles?.secondaryColor;
    const hex = resolveColorToHex(color, '#06b6d4');
    return { backgroundColor: `${hex}1f`, borderColor: `${hex}40`, color: hex };
  };

  const getBlockBgStyle = (styles: any) => {
    const custom = styles?.customBg || (styles?.bg?.startsWith('#') || styles?.bg?.startsWith('rgb') || styles?.bg?.startsWith('hsl') ? styles?.bg : null);
    return custom ? { backgroundColor: custom } : undefined;
  };

  const getTitleStyle = (styles: any) => {
    const custom = styles?.textColor || styles?.customTextColor || (styles?.text?.startsWith('#') || styles?.text?.startsWith('rgb') ? styles?.text : null);
    return custom ? { color: custom } : undefined;
  };

  const getSubtitleStyle = (styles: any) => {
    const custom = styles?.textColor || styles?.customTextColor || (styles?.text?.startsWith('#') || styles?.text?.startsWith('rgb') ? styles?.text : null);
    return custom ? { color: custom, opacity: 0.85 } : undefined;
  };

  const renderBrandLogo = (logoData: any) => {
    if (typeof logoData === 'string' && (logoData.startsWith('http') || logoData.startsWith('data:image') || logoData.startsWith('blob:'))) {
      return <img src={logoData} alt="Brand Logo" className="h-8 max-w-[160px] object-contain" />;
    }
    return <span>{logoData}</span>;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none relative">
      
      {/* Top Banner Bar for Published Preview */}
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 py-2.5 flex justify-between items-center text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-emerald-400 font-bold uppercase tracking-wider">● LIVE PUBLISHED PREVIEW</span>
          <span className="text-slate-600 font-mono">|</span>
          <span className="font-semibold text-slate-200">{project?.name || 'Tridop App Sandbox'}</span>
        </div>
        <button
          onClick={onBackToEditor}
          className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800 font-mono flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Editor
        </button>
      </header>

      {/* Rendered Live Site Blocks */}
      <main className="flex-1 flex flex-col">
        {blocks.length > 0 ? (
          blocks.map((block) => {
            const btnClass = block.styles.roundedButtons ? 'rounded-full' : 'rounded-lg';
            const isBgLight = block.styles.bg.includes('bg-white') || block.styles.bg.includes('bg-slate-50') || block.styles.bg.includes('bg-slate-100') || block.styles.bg.includes('bg-amber-50');
            const titleColorClass = isBgLight ? 'text-slate-900' : 'text-white';
            const subtitleColorClass = isBgLight ? 'text-slate-600' : 'text-slate-400';
            const borderClass = isBgLight ? 'border-slate-150' : 'border-slate-900';
            const innerCardClass = isBgLight ? 'bg-slate-50 border-slate-200/85 text-slate-800' : 'bg-slate-950/60 border-slate-900 text-slate-200';
            const inputBgClass = isBgLight ? 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400' : 'bg-slate-950 border-slate-800 text-slate-400';

            return (
              <div
                key={block.id}
                style={{ fontFamily: block.styles.fontFamily || 'inherit', ...getBlockBgStyle(block.styles) }}
                className={`relative ${block.styles.bg} ${block.styles.text}`}
              >
                <div className={block.styles.paddingY}>
                  
                  {/* NAVIGATION BLOCK */}
                  {block.type === 'navigation' && (
                    <div className="px-6 md:px-12 flex justify-between items-center max-w-7xl mx-auto">
                      <span style={getTitleStyle(block.styles)} className={`text-base font-extrabold tracking-tight flex items-center gap-1 ${titleColorClass}`}>
                        {renderBrandLogo(block.data.logo)}
                      </span>
                      <div className={`hidden md:flex items-center gap-6 text-xs font-medium ${subtitleColorClass}`}>
                        {block.data.links?.map((lnk, idx) => (
                          <span key={idx} style={getSubtitleStyle(block.styles)} className={`hover:${titleColorClass} transition-colors cursor-pointer`}>{lnk}</span>
                        ))}
                      </div>
                      {block.data.buttonText1 && (
                        <button style={getBtnStyle(block.styles)} className={`px-4 py-1.5 text-xs font-semibold ${btnClass}`}>
                          {block.data.buttonText1}
                        </button>
                      )}
                    </div>
                  )}

                  {/* HERO BLOCK */}
                  {block.type === 'hero' && (
                    <div className="px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                      <div className={`${block.data.placeholderImage ? 'md:col-span-7' : 'md:col-span-12 text-center'} space-y-5`}>
                        <h1 style={getTitleStyle(block.styles)} className={`text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight ${titleColorClass}`}>
                          {block.data.title}
                        </h1>
                        <p style={getSubtitleStyle(block.styles)} className={`text-sm md:text-base leading-relaxed max-w-2xl mx-auto ${subtitleColorClass}`}>
                          {block.data.subtitle}
                        </p>
                        <div className={`flex items-center gap-3 ${block.data.placeholderImage ? 'justify-start' : 'justify-center'}`}>
                          <button style={getBtnStyle(block.styles)} className={`px-5 py-2.5 text-xs font-bold ${btnClass} transition-all`}>
                            {block.data.buttonText1}
                          </button>
                          {block.data.buttonText2 && (
                            <button style={getSecondaryBtnStyle(block.styles)} className={`px-5 py-2.5 text-xs font-semibold border transition-all ${btnClass}`}>
                              {block.data.buttonText2}
                            </button>
                          )}
                        </div>
                      </div>

                      {block.data.placeholderImage && (
                        <div className="md:col-span-5 flex justify-center">
                          <div className={`relative rounded-2xl overflow-hidden border shadow-2xl ${borderClass}`}>
                            <img src={block.data.placeholderImage} alt="Feature Illustration" className="w-full h-auto object-cover max-h-72" referrerPolicy="no-referrer" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/25 to-transparent" />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* CONTENT GRID BLOCK */}
                  {block.type === 'content' && (
                    <div className="px-6 md:px-12 max-w-7xl mx-auto space-y-10">
                      <div className="text-center space-y-2">
                        <h2 style={getTitleStyle(block.styles)} className={`text-2xl md:text-3xl font-extrabold tracking-tight ${titleColorClass}`}>{block.data.title}</h2>
                        <p style={getSubtitleStyle(block.styles)} className={`text-xs md:text-sm max-w-xl mx-auto ${subtitleColorClass}`}>{block.data.subtitle}</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                        {block.data.items?.map((item: any, idx: number) => (
                          <div key={idx} className={`p-5 rounded-xl border space-y-3 ${innerCardClass}`}>
                            {item.metric && (
                              <div style={getAccentTextStyle(block.styles)} className="text-3xl font-black font-mono">{item.metric}</div>
                            )}

                            {!item.metric && (
                              <div style={getAccentBgStyle(block.styles)} className="w-8 h-8 rounded-lg border flex items-center justify-center font-bold">
                                ⚡
                              </div>
                            )}

                            <div className="space-y-1">
                              <h4 style={getTitleStyle(block.styles)} className={`text-sm font-semibold ${titleColorClass}`}>{item.title}</h4>
                              <p style={getSubtitleStyle(block.styles)} className={`text-[11px] leading-relaxed ${subtitleColorClass}`}>{item.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* MEDIA HIGHLIGHT BLOCK */}
                  {block.type === 'media' && (
                    <div className="px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                      <div className={`relative rounded-2xl overflow-hidden border shadow-lg ${borderClass}`}>
                        <img src={block.data.placeholderImage} alt="Media highlight" className="w-full h-auto object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="space-y-4">
                        <h2 style={getTitleStyle(block.styles)} className={`text-2xl md:text-3xl font-extrabold tracking-tight leading-snug ${titleColorClass}`}>{block.data.title}</h2>
                        <p style={getSubtitleStyle(block.styles)} className={`text-xs md:text-sm leading-relaxed ${subtitleColorClass}`}>{block.data.subtitle}</p>
                        <button style={getBtnStyle(block.styles)} className={`px-5 py-2 rounded-lg text-xs font-semibold ${btnClass}`}>
                          Learn More
                        </button>
                      </div>
                    </div>
                  )}

                  {/* SOCIAL PROOF BLOCK */}
                  {block.type === 'socialProof' && (
                    <div className="px-6 md:px-12 max-w-7xl mx-auto space-y-8">
                      <div className="text-center">
                        <h3 style={getTitleStyle(block.styles)} className={`text-xl font-bold ${titleColorClass}`}>{block.data.title}</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {block.data.items?.map((item: any, idx: number) => (
                          <div key={idx} className={`p-6 rounded-2xl border flex flex-col justify-between min-h-[140px] ${innerCardClass}`}>
                            <p style={getSubtitleStyle(block.styles)} className={`text-xs italic leading-relaxed ${subtitleColorClass}`}>"{item.desc}"</p>
                            <div className={`flex items-center gap-2 pt-4 border-t mt-4 ${borderClass}`}>
                              <div style={getAccentBgStyle(block.styles)} className="w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold">👤</div>
                              <span style={getTitleStyle(block.styles)} className={`text-[11px] font-semibold ${titleColorClass}`}>{item.title}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CTA SIGNUP BLOCK */}
                  {block.type === 'cta' && (
                    <div className="px-6 md:px-12 max-w-4xl mx-auto text-center space-y-6">
                      <h2 style={getTitleStyle(block.styles)} className={`text-2xl md:text-3xl font-extrabold tracking-tight ${titleColorClass}`}>{block.data.title}</h2>
                      <p style={getSubtitleStyle(block.styles)} className={`text-xs md:text-sm max-w-xl mx-auto leading-relaxed ${subtitleColorClass}`}>{block.data.subtitle}</p>
                      
                      <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          placeholder={block.data.formPlaceholder || 'Enter your email'}
                          className={`flex-1 px-4 py-2 text-xs rounded-lg border focus:outline-none ${inputBgClass}`}
                        />
                        <button style={getBtnStyle(block.styles)} className={`px-5 py-2 text-xs font-bold whitespace-nowrap ${btnClass}`}>
                          {block.data.buttonText1}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* FOOTER */}
                  {block.type === 'footer' && (
                    <div className="px-6 md:px-12 max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
                      <span style={getTitleStyle(block.styles)} className={`font-extrabold ${titleColorClass}`}>{renderBrandLogo(block.data.logo)}</span>
                      <p style={getSubtitleStyle(block.styles)} className={`text-[11px] ${subtitleColorClass}`}>{block.data.copyright}</p>
                    </div>
                  )}

                </div>
              </div>
            );
          })
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-3">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
            <h3 className="text-lg font-bold text-slate-200">Site Published</h3>
            <p className="text-xs text-slate-400">Your site is ready to view.</p>
          </div>
        )}
      </main>

    </div>
  );
};
