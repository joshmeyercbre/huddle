import Hero from "@/components/Hero";
import MetricsBar from "@/components/MetricsBar";
import CapabilitySection from "@/components/CapabilitySection";
import Footer from "@/components/Footer";
import { capabilities } from "@/data/capabilities";

import InvoiceValidation from "@/components/demos/InvoiceValidation";
import PhotoCount from "@/components/demos/PhotoCount";
import IvrAccuracy from "@/components/demos/IvrAccuracy";
import PhotoScanning from "@/components/demos/PhotoScanning";
import PhotoValidation from "@/components/demos/PhotoValidation";
import DataPipeline from "@/components/demos/DataPipeline";
import ReceiptExtraction from "@/components/demos/ReceiptExtraction";
import GpsTimecard from "@/components/demos/GpsTimecard";
import FieldOpsWeb from "@/components/demos/FieldOpsWeb";

const demoComponents: Record<string, React.ComponentType> = {
  "invoice-validation": InvoiceValidation,
  "photo-count": PhotoCount,
  "ivr-accuracy": IvrAccuracy,
  "photo-scanning": PhotoScanning,
  "photo-validation": PhotoValidation,
  "data-pipeline": DataPipeline,
  "receipt-extraction": ReceiptExtraction,
  "gps-timecard": GpsTimecard,
  "fieldops-web": FieldOpsWeb,
};

export default function Home() {
  return (
    <>
      <Hero />
      <MetricsBar />
      {capabilities.map((cap, index) => {
        const DemoComponent = demoComponents[cap.demoKey];
        return (
          <CapabilitySection key={cap.id} capability={cap} index={index}>
            {DemoComponent ? <DemoComponent /> : null}
          </CapabilitySection>
        );
      })}
      <Footer />
    </>
  );
}
