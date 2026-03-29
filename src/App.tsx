import React, { useState, useRef } from 'react';
import { Upload, Camera, Check, RefreshCw, Download, Briefcase, User, Settings, Image as ImageIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateCorporatePortrait } from './services/geminiService';

type Step = 'upload' | 'configure' | 'result';

interface PortraitOptions {
  style: string;
  clothing: string;
  clothingColor: string;
  environment: string;
  pose: string;
  fidelity: 'Alta' | 'Máxima';
  hasTie: boolean;
}

const CLOTHING_COLORS = [
  { name: 'Preto', hex: '#1a1a1a' },
  { name: 'Azul Marinho', hex: '#1e3a8a' },
  { name: 'Azul Royal', hex: '#2563eb' },
  { name: 'Cinza Chumbo', hex: '#374151' },
  { name: 'Cinza Claro', hex: '#9ca3af' },
  { name: 'Branco', hex: '#ffffff' },
  { name: 'Off-White', hex: '#f9fafb' },
  { name: 'Bege', hex: '#d1d5db' },
  { name: 'Caramelo', hex: '#92400e' },
  { name: 'Vinho', hex: '#7f1d1d' },
  { name: 'Verde Musgo', hex: '#14532d' },
  { name: 'Marrom Café', hex: '#451a03' }
];

const STYLES = [
  { name: 'Moderno' },
  { name: 'Clássico' },
  { name: 'Minimalista' },
  { name: 'Executivo' }
];

const CLOTHING = [
  { name: 'Terno Completo' },
  { name: 'Blazer e Camisa' },
  { name: 'Camisa Social' },
  { name: 'Business Casual' }
];

const ENVIRONMENTS = [
  { name: 'Escritório Moderno' },
  { name: 'Fundo Neutro (Estúdio)' },
  { name: 'Biblioteca Corporativa' },
  { name: 'Cidade ao Fundo' }
];

const POSES = [
  { name: 'Original', description: 'Mantém sua pose exata' },
  { name: 'Frontal', description: 'Olhando para a câmera' },
  { name: 'Perfil Sutil', description: 'Levemente de lado' }
];

export default function App() {
  const [step, setStep] = useState<Step>('upload');
  const [image, setImage] = useState<string | null>(null);
  const [logo, setLogo] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'comparison' | 'result'>('comparison');
  const [options, setOptions] = useState<PortraitOptions>({
    style: 'Moderno',
    clothing: 'Terno Completo',
    clothingColor: 'Preto',
    environment: 'Escritório Moderno',
    pose: 'Original',
    fidelity: 'Máxima',
    hasTie: true,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setStep('configure');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!image) return;
    setStep('result');
    setLoading(true);
    setError(null);
    try {
      const result = await generateCorporatePortrait(image, {
        ...options,
        companyLogoBase64: logo || undefined
      });
      setResultImage(result);
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar imagem. Por favor, tente novamente.');
      setStep('configure');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setLogo(null);
    setResultImage(null);
    setStep('upload');
  };

  const downloadImage = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = 'ensaio-corporativo.png';
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#1a1a1a] font-sans selection:bg-[#1a1a1a] selection:text-white">
      {/* Header */}
      <header className="border-b border-black/5 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#1a1a1a] rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold tracking-tight text-lg">Corporate AI</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-black/60">
            <a href="#" className="hover:text-black transition-colors">Como funciona</a>
            <a href="#" className="hover:text-black transition-colors">Galeria</a>
            <a href="#" className="hover:text-black transition-colors">Empresas</a>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {step === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto text-center space-y-8"
            >
              <div className="space-y-4">
                <h1 className="text-5xl font-light tracking-tight leading-tight">
                  Seu ensaio corporativo <br />
                  <span className="font-semibold italic">em segundos.</span>
                </h1>
                <p className="text-black/50 text-lg max-w-md mx-auto">
                  Transforme uma foto simples em um retrato profissional de alta qualidade para seu LinkedIn ou empresa.
                </p>
              </div>

              <div 
                onClick={() => fileInputRef.current?.click()}
                className="group relative border-2 border-dashed border-black/10 rounded-3xl p-12 bg-white hover:border-black/20 transition-all cursor-pointer overflow-hidden"
              >
                <div className="relative z-10 space-y-4">
                  <div className="w-16 h-16 bg-[#f5f5f5] rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-black/40" />
                  </div>
                  <div>
                    <p className="font-medium text-lg">Clique para enviar sua foto</p>
                    <p className="text-sm text-black/40">PNG, JPG até 10MB</p>
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  className="hidden" 
                  accept="image/*"
                />
              </div>

              <div className="grid grid-cols-3 gap-4 pt-8">
                {[
                  { icon: Camera, label: "IA de Ponta" },
                  { icon: User, label: "Fiel ao Rosto" },
                  { icon: Check, label: "Pronto p/ Uso" }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 text-black/40">
                    <item.icon className="w-5 h-5" />
                    <span className="text-xs font-medium uppercase tracking-widest">{item.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'configure' && (
            <motion.div
              key="configure"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid md:grid-cols-2 gap-12 items-start relative"
            >
              <div className="space-y-6 md:sticky md:top-24">
                <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-white shadow-xl border border-black/5">
                  {image && <img src={image} alt="Preview" className="w-full h-full object-cover" />}
                </div>
                <button 
                  onClick={() => setStep('upload')}
                  className="w-full py-4 rounded-2xl border border-black/10 font-medium hover:bg-white transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" /> Alterar Foto
                </button>
              </div>

              <div className="space-y-8">
                <div className="space-y-2">
                  <h2 className="text-3xl font-semibold tracking-tight">Personalize seu Ensaio</h2>
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      {error}
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {/* Style Selection */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-widest text-black/40 flex items-center gap-2">
                      <Settings className="w-3 h-3" /> Estilo Fotográfico
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {STYLES.map(s => (
                        <button
                          key={s.name}
                          onClick={() => setOptions({ ...options, style: s.name })}
                          className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                            options.style === s.name 
                            ? 'bg-[#1a1a1a] text-white shadow-lg' 
                            : 'bg-white border border-black/5 hover:border-black/20'
                          }`}
                        >
                          {s.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Clothing Selection */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-widest text-black/40 flex items-center gap-2">
                      <ImageIcon className="w-3 h-3" /> Traje Corporativo
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {CLOTHING.map(c => (
                        <button
                          key={c.name}
                          onClick={() => setOptions({ ...options, clothing: c.name })}
                          className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                            options.clothing === c.name 
                            ? 'bg-[#1a1a1a] text-white shadow-lg' 
                            : 'bg-white border border-black/5 hover:border-black/20'
                          }`}
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>

                    {/* Color Selection */}
                    <div className="space-y-2 pt-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-black/30">Cor do Traje</p>
                      <div className="flex flex-wrap gap-2">
                        {CLOTHING_COLORS.map(color => (
                          <button
                            key={color.name}
                            onClick={() => setOptions({ ...options, clothingColor: color.name })}
                            title={color.name}
                            className={`w-8 h-8 rounded-full border-2 transition-all ${
                              options.clothingColor === color.name 
                              ? 'border-black scale-110 shadow-md' 
                              : 'border-transparent hover:scale-105'
                            }`}
                            style={{ backgroundColor: color.hex }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={() => setOptions({ ...options, hasTie: !options.hasTie })}
                        className={`w-12 h-6 rounded-full transition-colors relative ${options.hasTie ? 'bg-black' : 'bg-black/10'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${options.hasTie ? 'left-7' : 'left-1'}`} />
                      </button>
                      <span className="text-sm font-medium">Usar Gravata</span>
                    </div>
                  </div>

                  {/* Environment Selection */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-widest text-black/40 flex items-center gap-2">
                      <ImageIcon className="w-3 h-3" /> Ambiente
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {ENVIRONMENTS.map(e => (
                        <button
                          key={e.name}
                          onClick={() => setOptions({ ...options, environment: e.name })}
                          className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                            options.environment === e.name 
                            ? 'bg-[#1a1a1a] text-white shadow-lg' 
                            : 'bg-white border border-black/5 hover:border-black/20'
                          }`}
                        >
                          {e.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pose Selection */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-widest text-black/40 flex items-center gap-2">
                      <User className="w-3 h-3" /> Pose e Postura
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {POSES.map(p => (
                        <button
                          key={p.name}
                          onClick={() => setOptions({ ...options, pose: p.name })}
                          className={`py-3 px-2 rounded-xl text-[11px] font-medium transition-all flex flex-col items-center gap-1 ${
                            options.pose === p.name 
                            ? 'bg-[#1a1a1a] text-white shadow-lg' 
                            : 'bg-white border border-black/5 hover:border-black/20'
                          }`}
                        >
                          <span className="font-bold">{p.name}</span>
                          <span className={`text-[9px] opacity-60 ${options.pose === p.name ? 'text-white' : 'text-black'}`}>{p.description}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Fidelity Selection */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-widest text-black/40 flex items-center gap-2">
                      <Settings className="w-3 h-3" /> Fidelidade de Identidade
                    </label>
                    <div className="flex gap-2">
                      {(['Alta', 'Máxima'] as const).map(f => (
                        <button
                          key={f}
                          onClick={() => setOptions({ ...options, fidelity: f })}
                          className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                            options.fidelity === f 
                            ? 'bg-[#1a1a1a] text-white shadow-lg' 
                            : 'bg-white border border-black/5 hover:border-black/20'
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-black/40 italic">
                      {options.fidelity === 'Máxima' 
                        ? 'Prioriza manter cada detalhe do rosto original, evitando qualquer alteração estética.' 
                        : 'Equilibra a identidade com o acabamento profissional de estúdio.'}
                    </p>
                  </div>

                  {/* Logo Upload */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-widest text-black/40 flex items-center gap-2">
                      <Briefcase className="w-3 h-3" /> Logo da Empresa (Opcional)
                    </label>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (e: any) => handleLogoUpload(e);
                          input.click();
                        }}
                        className="flex-1 py-3 px-4 rounded-xl text-sm font-medium bg-white border border-black/5 hover:border-black/20 flex items-center justify-center gap-2"
                      >
                        {logo ? <Check className="w-4 h-4 text-green-500" /> : <Upload className="w-4 h-4" />}
                        {logo ? 'Logo Carregado' : 'Carregar Logo'}
                      </button>
                      {logo && (
                        <button 
                          onClick={() => setLogo(null)}
                          className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          Remover
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full py-5 bg-[#1a1a1a] text-white rounded-2xl font-semibold text-lg hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Gerando Retrato...
                    </>
                  ) : (
                    <>
                      <Check className="w-6 h-6" />
                      Gerar Ensaio Profissional
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {step === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-7xl mx-auto space-y-16 px-6"
            >
              <div className="text-center space-y-8 max-w-2xl mx-auto">
                <div className="space-y-4">
                  <h2 className="text-5xl md:text-6xl font-semibold tracking-tight leading-tight">Seu Novo Retrato Profissional</h2>
                  <p className="text-black/50 text-xl leading-relaxed">A IA transformou sua foto mantendo sua essência com um acabamento de estúdio premium.</p>
                </div>

                <div className="inline-flex p-1 bg-black/5 rounded-2xl">
                  <button
                    onClick={() => setViewMode('comparison')}
                    className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      viewMode === 'comparison' 
                      ? 'bg-white text-black shadow-sm' 
                      : 'text-black/40 hover:text-black/60'
                    }`}
                  >
                    Comparação
                  </button>
                  <button
                    onClick={() => setViewMode('result')}
                    className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      viewMode === 'result' 
                      ? 'bg-white text-black shadow-sm' 
                      : 'text-black/40 hover:text-black/60'
                    }`}
                  >
                    Apenas Resultado
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                <div className="lg:col-span-8 space-y-12">
                  {viewMode === 'comparison' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Before Container */}
                      <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">Foto Original</span>
                          <div className="h-[1px] flex-1 mx-4 bg-black/5" />
                        </div>
                        <div className="aspect-[3/4] rounded-[2rem] overflow-hidden bg-white shadow-sm border border-black/5 relative group">
                          {image && (
                            <img 
                              src={image} 
                              alt="Antes" 
                              className="w-full h-full object-cover" 
                            />
                          )}
                          <div className="absolute inset-0 bg-black/5 pointer-events-none" />
                        </div>
                      </div>

                      {/* After Container */}
                      <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1a1a]">Resultado IA</span>
                          <div className="h-[1px] flex-1 mx-4 bg-black/10" />
                          <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Otimizado</span>
                        </div>
                        <div className="aspect-[3/4] rounded-[2rem] overflow-hidden bg-white shadow-2xl border border-black/5 relative group">
                          {loading ? (
                            <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center gap-6">
                              <div className="relative">
                                <Loader2 className="w-16 h-16 animate-spin text-black/10" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-2 h-2 bg-black rounded-full animate-pulse" />
                                </div>
                              </div>
                              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/30 animate-pulse">Renderizando Detalhes</p>
                            </div>
                          ) : resultImage && (
                            <img 
                              src={resultImage} 
                              alt="Depois" 
                              className="w-full h-full object-cover" 
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-xl mx-auto space-y-6">
                      <div className="flex items-center justify-between px-2">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1a1a]">Retrato Final</span>
                        <div className="h-[1px] flex-1 mx-4 bg-black/10" />
                        <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Pronto</span>
                      </div>
                      <div className="aspect-[3/4] rounded-[2.5rem] overflow-hidden bg-white shadow-2xl border border-black/5 relative group">
                        {resultImage && (
                          <img 
                            src={resultImage} 
                            alt="Resultado Final" 
                            className="w-full h-full object-cover" 
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="lg:col-span-4 lg:sticky lg:top-32">
                  <div className="bg-white p-10 rounded-[2.5rem] border border-black/5 space-y-10 shadow-sm">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-2xl tracking-tight">Pronto para o Sucesso</h3>
                        <p className="text-sm text-black/50 leading-relaxed">Seu novo retrato está pronto para elevar sua presença profissional.</p>
                      </div>
                      
                      <ul className="space-y-5">
                        {[
                          { text: "Alta Resolução (4K)", icon: Check },
                          { text: "Iluminação de Estúdio", icon: Check },
                          { text: "Fidelidade de Identidade", icon: Check },
                          { text: "Fundo Otimizado", icon: Check }
                        ].map((item, i) => (
                          <li key={i} className="flex items-center gap-4 text-black/70 text-sm">
                            <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                              <item.icon className="w-3.5 h-3.5" />
                            </div>
                            <span className="font-medium">{item.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-10 border-t border-black/5 space-y-4">
                      <button 
                        onClick={downloadImage}
                        disabled={loading}
                        className="w-full py-6 bg-[#1a1a1a] text-white rounded-2xl font-semibold text-lg hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl shadow-black/10 hover:shadow-black/20 active:scale-[0.98] disabled:opacity-50"
                      >
                        <Download className="w-6 h-6" /> Baixar Retrato
                      </button>
                      <button 
                        onClick={reset}
                        className="w-full py-5 rounded-2xl border border-black/10 font-medium hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                      >
                        <RefreshCw className="w-4 h-4" /> Tentar Outra Foto
                      </button>
                    </div>

                    <div className="pt-6 text-center">
                      <p className="text-[10px] text-black/30 font-bold uppercase tracking-widest">Garantia de Qualidade Corporate AI</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-black/5 py-12 mt-12 bg-white">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-40">
            <Briefcase className="w-5 h-5" />
            <span className="font-semibold tracking-tight">Corporate AI</span>
          </div>
          <p className="text-sm text-black/40">
            © 2026 Corporate AI. Todos os direitos reservados.
          </p>
          <div className="flex gap-6 text-sm font-medium text-black/40">
            <a href="#" className="hover:text-black transition-colors">Privacidade</a>
            <a href="#" className="hover:text-black transition-colors">Termos</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
