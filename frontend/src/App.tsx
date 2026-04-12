import { HashRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import Index from './pages/Index';

const App = () => (
  <HashRouter>
    <Routes>
      <Route path="/" element={<Index />} />
    </Routes>
    <Toaster position="top-right" richColors />
  </HashRouter>
);

export default App;
