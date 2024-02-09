import { createPortal } from "react-dom";
import {
  HTMLAttributes,
  ReactNode,
  createContext,
  useMemo,
  useState,
  useContext,
} from "react";

type PortalProps = {
  children: ReactNode;
  container?: HTMLElement;
};

const Portal = ({ children, container }: PortalProps) => {
  if (!container) {
    return null;
  }

  return createPortal(children, container);
};

type TabsContextType = {
  activeTab: string | null;
  controlsContainer?: HTMLDivElement;
  updateActiveTab: (key: string) => void;
  updateControlsContainer: (node: HTMLDivElement) => void;
};

const TabsContext = createContext<TabsContextType | null>(null);

const TabsProvider = ({ children }: { children: ReactNode }) => {
  const [controlsContainer, setControlsContainer] = useState<HTMLDivElement>();
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const value = useMemo(() => {
    return {
      activeTab,
      controlsContainer,
      updateControlsContainer: setControlsContainer,
      updateActiveTab: setActiveTab,
    };
  }, [controlsContainer, activeTab, setControlsContainer, setActiveTab]);

  return <TabsContext.Provider value={value}>{children}</TabsContext.Provider>;
};

const useTabs = () => {
  const context = useContext(TabsContext);

  if (!context) {
    throw new Error("useTabs must be used within a TabsProvider");
  }

  return context;
};

const Tabs: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  children,
  ...props
}) => {
  const { updateControlsContainer } = useTabs();

  return (
    <div {...props}>
      <div ref={updateControlsContainer} className="controls" />
      <div className="panels">{children}</div>
    </div>
  );
};

type TabProps = HTMLAttributes<HTMLDivElement> & {
  name: string;
  title: string;
};

const Tab: React.FC<TabProps> = ({ children, name, title, ...props }) => {
  const { controlsContainer, activeTab, updateActiveTab } = useTabs();

  return (
    <>
      <Portal container={controlsContainer}>
        <div {...props} onClick={() => updateActiveTab(name)}>
          {title}
        </div>
      </Portal>
      <div hidden={activeTab !== name}>{children}</div>
    </>
  );
};

function App() {
  return (
    <TabsProvider>
      <Tabs>
        <Tab name="1" title="Tab 1">
          Hello World 1
        </Tab>
        <Tab name="2" title="Tab 2">
          Hello World 2
        </Tab>
        <Tab name="3" title="Tab 3">
          Hello World 3
        </Tab>
      </Tabs>
    </TabsProvider>
  );
}

export default App;
