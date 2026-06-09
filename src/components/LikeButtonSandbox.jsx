import React, { useState, useEffect, useRef } from 'react';
import { Heart, Play, RefreshCw, ShieldAlert, Cpu, Check, AlertCircle, Database, Server, Layers, ChevronRight } from 'lucide-react';

export default function LikeButtonSandbox() {
  const [activePhase, setActivePhase] = useState('phase1');
  
  // Simulated database metrics
  const [displayedLikesInDB, setDisplayedLikesInDB] = useState(100);
  const [actualLikesAttempted, setActualLikesAttempted] = useState(100);
  const [ledgerCount, setLedgerCount] = useState(0);
  const [queueSize, setQueueSize] = useState(0);
  const [redisLikesSet, setRedisLikesSet] = useState(new Set());
  
  // Infrastructure telemetry
  const [cpuLoad, setCpuLoad] = useState(12);
  const [activeConnections, setActiveConnections] = useState(0);
  const [timeoutsCount, setTimeoutsCount] = useState(0);
  const [systemState, setSystemState] = useState('STABLE'); // STABLE | CHOKED | CRASHED
  
  const [logs, setLogs] = useState([
    "🚀 Distributed Simulation Engine booted online.",
    "👉 Select a Phase tab to observe how architectural changes affect load factors."
  ]);
  
  const [isSimulating, setIsSimulating] = useState(false);
  const [hasUserLiked, setHasUserLiked] = useState(false);
  const logsContainerRef = useRef(null);

  // Scroll logs automatically inside the terminal box only (prevents viewport jumping)
  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (msg) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const resetSimulator = () => {
    setDisplayedLikesInDB(100);
    setActualLikesAttempted(100);
    setLedgerCount(0);
    setQueueSize(0);
    setRedisLikesSet(new Set());
    setCpuLoad(8);
    setActiveConnections(0);
    setTimeoutsCount(0);
    setSystemState('STABLE');
    setHasUserLiked(false);
    setLogs([
      "🧹 Telemetry buffer cleared and reset to initial reference baseline.",
      `🔄 Active architecture: ${getPhaseName(activePhase).toUpperCase()}`
    ]);
  };

  const getPhaseName = (phase) => {
    switch (phase) {
      case 'phase1': return 'Phase 1: Toy Counter (Naive)';
      case 'phase2': return 'Phase 2: Identity Ledger';
      case 'phase3': return 'Phase 3: Row Locks (Pessimistic)';
      case 'phase4': return 'Phase 4: Async Cache + Queue';
      default: return '';
    }
  };

  useEffect(() => {
    resetSimulator();
  }, [activePhase]);

  // Handles a single user manual "Like" click
  const handleSingleLike = async () => {
    if (isSimulating) return;
    
    setActualLikesAttempted((prev) => prev + 1);

    switch (activePhase) {
      case 'phase1': {
        // Naive inline update simulation
        addLog("👤 [User Click] GET likes count from posts table...");
        const currentVal = displayedLikesInDB;
        addLog(`📦 DB Read Success: likes_count = ${currentVal}`);
        
        setActiveConnections(1);
        setCpuLoad(15);
        
        setTimeout(() => {
          setDisplayedLikesInDB(currentVal + 1);
          setHasUserLiked(true);
          setActiveConnections(0);
          setCpuLoad(8);
          addLog(`💾 DB Write Success: UPDATE posts SET likes = ${currentVal + 1}`);
        }, 120);
        break;
      }
      case 'phase2': {
        // Ledger table check
        if (hasUserLiked) {
          addLog("👤 [User Click] unlike toggled: SELECT from post_likes...");
          addLog("❌ User has already liked. Removing ledger row.");
          setLedgerCount((prev) => Math.max(0, prev - 1));
          setDisplayedLikesInDB((prev) => Math.max(0, prev - 1));
          setHasUserLiked(false);
        } else {
          addLog("👤 [User Click] SELECT 1 FROM post_likes WHERE user_id = 'user_99'...");
          addLog("➕ ID not found. INSERT INTO post_likes (user_id, post_id)...");
          setLedgerCount((prev) => prev + 1);
          setDisplayedLikesInDB((prev) => prev + 1);
          setHasUserLiked(true);
          addLog("💾 DB Transaction finished successfully.");
        }
        break;
      }
      case 'phase3': {
        // SELECT ... FOR UPDATE simulation
        addLog("👤 [User Click] BEGIN TRANSACTION; SELECT likes FOR UPDATE...");
        addLog("🔒 Row 'post_123' locked exclusively by Thread #42...");
        setActiveConnections(1);
        setCpuLoad(22);
        
        setTimeout(() => {
          if (hasUserLiked) {
            setDisplayedLikesInDB((prev) => prev - 1);
            setHasUserLiked(false);
            addLog("🔓 Row updated (likes - 1) and lock released. COMMIT;");
          } else {
            setDisplayedLikesInDB((prev) => prev + 1);
            setHasUserLiked(true);
            addLog("🔓 Row updated (likes + 1) and lock released. COMMIT;");
          }
          setActiveConnections(0);
          setCpuLoad(8);
        }, 150);
        break;
      }
      case 'phase4': {
        // Redis Set checks (SADD) + Queue publish
        addLog("👤 [User Click] SADD post:123:likes 'user_99' in Redis cache RAM...");
        
        const isNew = !redisLikesSet.has('user_99');
        if (isNew) {
          const freshSet = new Set(redisLikesSet);
          freshSet.add('user_99');
          setRedisLikesSet(freshSet);
          setHasUserLiked(true);
          setDisplayedLikesInDB((prev) => prev + 1);
          addLog("⚡ Redis: SET ADD successful. unique_clicker = TRUE.");
          addLog("📬 SQS/Kafka: published event {action: 'LIKE', userId: 'user_99'} to partition-key 'post_123'");
        } else {
          const freshSet = new Set(redisLikesSet);
          freshSet.delete('user_99');
          setRedisLikesSet(freshSet);
          setHasUserLiked(false);
          setDisplayedLikesInDB((prev) => Math.max(0, prev - 1));
          addLog("⚡ Redis: SREM user_99 from Likes Set successfully.");
          addLog("📬 SQS/Kafka: published event {action: 'UNLIKE', userId: 'user_99'} to partition-key 'post_123'");
        }
        break;
      }
    }
  };

  // Simulates 100 concurrent requests over a very short time
  const triggerViralStampede = async () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSystemState('STABLE');
    setTimeoutsCount(0);
    const concurrentCount = 100;
    setActualLikesAttempted((prev) => prev + concurrentCount);
    addLog(`🚨 TRIGGERING CONCURRENT STAMPEDE: Spawning ${concurrentCount} concurrent HTTP threads simulating a celebrity retweet!`);

    if (activePhase === 'phase1') {
      // NAIVE CONCURRENCY: Reads and writes overlap heavily.
      // E.g., we stall, read, they all read the SAME initial count (e.g. 100).
      // They increment, write back.
      setActiveConnections(18); // connection pool spikes
      setCpuLoad(45);
      addLog("🧵 Threads #1 to #100 generated. Batch spawning API controllers...");
      
      const startCount = displayedLikesInDB;
      let writtenCount = 0;
      
      // Simulate over staggered intervals
      for (let i = 1; i <= concurrentCount; i++) {
        setTimeout(() => {
          if (i === 1 || i === 15 || i === 30 || i === 50 || i === 75 || i === 100) {
            addLog(`🧵 [Thread #${i}] Reads DB row: likes = ${startCount}`);
          }
          
          // Only a small fraction of writes are ordered safely.
          // Let's say only about 14 unique writes survive, or each write replaces the last.
          const progressStep = Math.min(concurrentCount, Math.floor(Math.random() * 15) + 1);
          if (i === concurrentCount) {
            const finalLostCount = startCount + progressStep;
            setDisplayedLikesInDB(finalLostCount);
            setActiveConnections(0);
            setCpuLoad(12);
            setIsSimulating(false);
            setSystemState('STABLE');
            addLog(`💾 [System] Overlapping write transactions completed. Naive static row settled at: ${finalLostCount}`);
            addLog(`🚨 LOST WRITE WARNING: Over ${100 - progressStep} updates were overwritten due to race conditions (dirty memory read overrides)!`);
          }
        }, i * 15);
      }
    } 
    
    else if (activePhase === 'phase2') {
      // LEDGER OVERHEAD: High aggregate cost
      // Every thread queries SELECT COUNT(*) FROM post_likes which scans deep directories
      setActiveConnections(20); // Fully exhausts pool
      setCpuLoad(98);
      setSystemState('CHOKED');
      addLog("🔐 [DB Connection Pool] WARNING: Active connection count spiked to maximum pool limit (20/20)!");
      addLog("💾 [Query Analyzer] Sequential full-table scan triggered across simulated index ledger...");
      
      let ledgerRowsAdded = 0;
      for (let i = 1; i <= concurrentCount; i++) {
        setTimeout(() => {
          ledgerRowsAdded += 1;
          setLedgerCount(prev => prev + 1);
          
          if (i % 20 === 0) {
            addLog(`🧵 [Thread #${i}] Aggregating counts: SELECT COUNT(*) ... executing full-table scans.`);
          }
          
          if (i === concurrentCount) {
            setDisplayedLikesInDB(prev => prev + ledgerRowsAdded);
            setActiveConnections(0);
            setCpuLoad(18);
            setIsSimulating(false);
            setSystemState('STABLE');
            addLog(`✅ Ledger counts aggregated. Total persistent entries registered: ${ledgerRowsAdded}.`);
            addLog("⚠️ Performance Bottleneck: CPU load hit 98% due to naively querying heavy COUNT aggregates synchronously.");
          }
        }, i * 35);
      }
    } 
    
    else if (activePhase === 'phase3') {
      // PESSIMISTIC LOCKING: Thread blocks, timing out
      setActiveConnections(20);
      setCpuLoad(100);
      setSystemState('CRASHED');
      
      addLog("🛑 LOCK contention started. Thread #1 locks 'post_123' row...");
      
      let processingDelay = 20; // ms per lock hold
      let timeouts = 0;
      let successfulLocks = 0;

      for (let i = 1; i <= concurrentCount; i++) {
        setTimeout(() => {
          if (i <= 18) {
            successfulLocks += 1;
            setDisplayedLikesInDB(prev => prev + 1);
            if (i === 1) {
              addLog(`🔒 [Thread #1] Row lock acquired. Sleep ${processingDelay}ms...`);
            }
            if (i === 10) {
              addLog(`⏳ [Thread #10] Blocked in pool queue, waiting for row release...`);
            }
          } else {
            // Pool connection timeout (504 gateway exception)
            timeouts += 1;
            setTimeoutsCount(prev => prev + 1);
            if (i === 20 || i === 50 || i === 90) {
              addLog(`🚨 [Thread #${i}] EXCEPTION: DB connection pool wait timeout! (Capacity 20 exceeded!) -> HTTP 504 Gateway Error`);
            }
          }

          if (i === concurrentCount) {
            setActiveConnections(0);
            setCpuLoad(14);
            setIsSimulating(false);
            setSystemState('STABLE');
            addLog(`📋 Concurrency results: ${successfulLocks} lock queues completed. ${timeouts} requests timed out (crushed connection pools!).`);
          }
        }, i * 25);
      }
    } 
    
    else if (activePhase === 'phase4') {
      // ASYNC MQ + REDIS CACHE: Instant acceptance, smooth queue bleed-out.
      setCpuLoad(8);
      setActiveConnections(2);
      addLog("🚀 [Ingest Edge] Handshaking batch requests with Redis set in memory...");
      
      let addedToSet = 0;
      let mockSet = new Set(redisLikesSet);
      
      for (let i = 1; i <= concurrentCount; i++) {
        const fakeUserId = `bot_concur_${i}`;
        mockSet.add(fakeUserId);
        addedToSet += 1;
      }
      setRedisLikesSet(mockSet);
      addLog(`⚡ Redis pipeline: atomically ingested ${concurrentCount} writes into RAM set.`);
      
      // Load them into the Message Queue
      setQueueSize(concurrentCount);
      addLog(`📬 Kafka/SQS: Queued ${concurrentCount} 'LIKE' event packets in transit.`);
      
      // Let the consumer drain the queue smoothly
      let currentQueue = concurrentCount;
      const drainInterval = setInterval(() => {
        const step = Math.min(currentQueue, 12);
        currentQueue -= step;
        setQueueSize(currentQueue);
        setDisplayedLikesInDB(prev => prev + step);
        
        // Simulates consumer logging
        addLog(`🔧 [Consumer Worker] Batch-updated database set on +${step} likes. Queue remaining: ${currentQueue}`);
        
        if (currentQueue <= 0) {
          clearInterval(drainInterval);
          setActiveConnections(0);
          setCpuLoad(6);
          setIsSimulating(false);
          addLog("⭐️ [Consumer Worker] Event loop fully drained. Database counts reconciled smoothly with 100% precision!");
        }
      }, 350);
    }
  };

  return (
    <div id="like-button-sandbox" className="border-4 border-black bg-[#faf8f5] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] my-12 text-black overflow-hidden">
      
      {/* Header Info */}
      <div className="bg-[#bdc2ff] text-black border-b-4 border-black p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="font-mono text-[10px] md:text-xs uppercase bg-black text-white border border-black px-2 py-0.5 font-bold tracking-wider select-none">
            🛠️ Architecture Lab Sandbox
          </span>
          <h4 className="font-heading text-xl md:text-2xl font-black uppercase mt-1">
            Distributed Likes Bottleneck Simulator
          </h4>
        </div>
        <button 
          onClick={resetSimulator}
          disabled={isSimulating}
          className="border-2 border-black bg-white hover:bg-neutral-100 font-heading font-black text-xs uppercase tracking-wide px-3 py-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] disabled:bg-neutral-200 cursor-pointer"
        >
          <RefreshCw className="inline-block mr-1 w-3.5 h-3.5" />
          Clear Baseline
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap border-b-4 border-black divide-x-2 divide-black">
        {['phase1', 'phase2', 'phase3', 'phase4'].map((phaseKey) => (
          <button
            key={phaseKey}
            disabled={isSimulating}
            onClick={() => setActivePhase(phaseKey)}
            className={`flex-1 p-3 font-heading text-[10px] md:text-xs uppercase tracking-tight font-black transition-colors ${
              activePhase === phaseKey 
                ? 'bg-[#FFE600] text-black' 
                : 'bg-white hover:bg-neutral-50 text-neutral-600 disabled:opacity-50'
            }`}
          >
            {phaseKey === 'phase1' && "Phase 1: Naive"}
            {phaseKey === 'phase2' && "Phase 2: Identity Ledger"}
            {phaseKey === 'phase3' && "Phase 3: Row Locking"}
            {phaseKey === 'phase4' && "Phase 4: Async Cache"}
          </button>
        ))}
      </div>

      {/* Main Grid: Control & Live Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 border-b-4 border-black">
        
        {/* Interactive Controls */}
        <div className="lg:col-span-4 p-6 border-b-4 lg:border-b-0 lg:border-r-4 border-black flex flex-col justify-between bg-white">
          <div className="space-y-4">
            <h5 className="font-heading font-black text-xs text-zinc-500 uppercase tracking-widest border-b border-dashed border-black pb-1">
              Active Control Station
            </h5>
            <p className="font-sans text-xs text-neutral-600 leading-relaxed font-normal">
              {activePhase === 'phase1' && "A simple integer row update. Easy to build, but users can spam infinite clicks, and rapid hits drop write metrics completely via overlapping read-swaps."}
              {activePhase === 'phase2' && "Checks a relational composite index mapping to toggle state. Reading total metrics requires costly full-table COUNT scans that exhaust CPU cores during high traffic loads."}
              {activePhase === 'phase3' && "Enforces row locking on the counter record. Transactions queuing up concurrently exhaust database connections, causing cascading 504 system gateway crashes."}
              {activePhase === 'phase4' && "Ingests writes instantly in-memory (Redis set checks) and decouples writing loads via message streams. Safe, fast, and robust, with ultimate precision!"}
            </p>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                onClick={handleSingleLike}
                disabled={isSimulating}
                className={`w-full group border-2 border-black p-4 font-heading font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer ${
                  hasUserLiked ? 'bg-[#ffb2bf] text-[#ca0055]' : 'bg-[#e0ffca] text-emerald-950'
                }`}
              >
                <Heart className={`w-5 h-5 ${hasUserLiked ? 'fill-[#ca0055] text-[#ca0055]' : 'text-black group-hover:scale-110 transition-transform'}`} />
                {hasUserLiked ? 'Click to Unlike' : 'Click to Like'}
              </button>

              <button
                onClick={triggerViralStampede}
                disabled={isSimulating}
                className="w-full border-2 border-black bg-black text-white hover:bg-neutral-800 p-4 font-heading font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all disabled:bg-neutral-200 disabled:text-neutral-500 cursor-pointer"
              >
                <Play className="w-4 h-4 text-[#FFE600] fill-[#FFE600] animate-pulse" />
                Simulate 100-User Stampede!
              </button>
            </div>
          </div>

          <div className="mt-6 border-t border-dashed border-black pt-4">
            <div className="text-[10px] font-mono font-bold uppercase text-neutral-400">Current Method Signature</div>
            <pre className="p-2 border border-black bg-zinc-950 text-emerald-400 font-mono text-[9px] overflow-x-auto rounded-sm mt-1 leading-tight select-text">
              {activePhase === 'phase1' && `def like(id):
  count = find(id)
  save(id, count + 1)`}
              {activePhase === 'phase2' && `def like(u_id, p_id):
  liked = check_join(u_id)
  if not liked:
    insert_join(u_id)`}
              {activePhase === 'phase3' && `def like(id):
  # lock-and-wait
  select_for_update(id)
  update(id)`}
              {activePhase === 'phase4' && `async def like(u_id, p_id):
  is_new = redis_sadd(p_id, u_id)
  if is_new:
    publish_mq(p_id, u_id)`}
            </pre>
          </div>
        </div>

        {/* Live Infrastructure Telemetry Dashboard */}
        <div className="lg:col-span-8 p-6 bg-neutral-50 flex flex-col justify-between">
          <div>
            <h5 className="font-heading font-black text-xs text-zinc-500 uppercase tracking-widest border-b border-dashed border-black pb-1 mb-4">
              Hardware Telemetry Array
            </h5>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              
              {/* Stat 1 */}
              <div className="border-2 border-black bg-white p-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
                <div className="font-mono text-[9px] font-bold text-neutral-400 uppercase">Input Clicks</div>
                <div className="font-heading text-2xl font-black mt-1 text-black">{actualLikesAttempted}</div>
                <div className="font-mono text-[8px] text-zinc-500 mt-1 uppercase">External requests</div>
              </div>

              {/* Stat 2 */}
              <div className="border-2 border-black bg-white p-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
                <div className="font-mono text-[9px] font-bold text-neutral-400 uppercase">Likes in DB Row</div>
                <div className="font-heading text-2xl font-black mt-1 text-black">
                  {displayedLikesInDB}
                </div>
                <div className="font-mono text-[8px] mt-1 text-amber-600 font-bold uppercase">
                  {activePhase === 'phase1' && actualLikesAttempted > 100 && displayedLikesInDB - 100 < actualLikesAttempted - 100 ? "⚠️ Lost updates!" : "✓ 100% precision"}
                </div>
              </div>

              {/* Stat 3 */}
              <div className="border-2 border-black bg-white p-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
                <div className="font-mono text-[9px] font-bold text-neutral-400 uppercase">Ledger Records</div>
                <div className="font-heading text-2xl font-black mt-1 text-black">
                  {activePhase === 'phase4' ? redisLikesSet.size : ledgerCount}
                </div>
                <div className="font-mono text-[8px] text-zinc-500 mt-1 uppercase">
                  {activePhase === 'phase4' ? "Redis RAM Set" : "SQL Join rows"}
                </div>
              </div>

              {/* Stat 4 */}
              <div className="border-2 border-black bg-white p-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
                <div className="font-mono text-[9px] font-bold text-red-500 uppercase">Crashes & Error 504</div>
                <div className="font-heading text-2xl font-black mt-1 text-red-600">{timeoutsCount}</div>
                <div className="font-mono text-[8px] text-zinc-500 mt-1 uppercase">Connection timeoutss</div>
              </div>

            </div>

            {/* Live gauges */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-black/10 pt-4 mb-4">
              
              {/* CPU load */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-mono text-[10px] text-zinc-600 uppercase font-black">CPU Load Factor</span>
                  <span className={`font-mono text-[10px] font-black ${cpuLoad > 80 ? 'text-red-600 animate-pulse' : 'text-zinc-600'}`}>{cpuLoad}%</span>
                </div>
                <div className="w-full bg-neutral-200 h-3 border border-black rounded-sm overflow-hidden p-0.5">
                  <div 
                    className={`h-full border border-black/20 transition-all ${cpuLoad > 85 ? 'bg-red-500 animate-pulse' : cpuLoad > 50 ? 'bg-yellow-400' : 'bg-emerald-400'}`}
                    style={{ width: `${cpuLoad}%` }}
                  />
                </div>
              </div>

              {/* Conn Pool */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-mono text-[10px] text-zinc-600 uppercase font-black">SQL Connections</span>
                  <span className="font-mono text-[10px] font-black">{activeConnections} / 20 Limit</span>
                </div>
                <div className="w-full bg-neutral-200 h-3 border border-black rounded-sm overflow-hidden p-0.5">
                  <div 
                    className={`h-full border border-black/20 transition-all ${activeConnections >= 18 ? 'bg-red-500 animate-pulse' : 'bg-blue-400'}`}
                    style={{ width: `${(activeConnections / 20) * 100}%` }}
                  />
                </div>
              </div>

              {/* Buffer Size */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-mono text-[10px] text-zinc-600 uppercase font-black">MQ Stream Buffer</span>
                  <span className="font-mono text-[10px] font-black">{queueSize} msgs</span>
                </div>
                <div className="w-full bg-neutral-200 h-3 border border-black rounded-sm overflow-hidden p-0.5">
                  <div 
                    className="h-full border border-black/20 bg-purple-400 transition-all"
                    style={{ width: `${Math.min(100, (queueSize / 100) * 100)}%` }}
                  />
                </div>
              </div>

            </div>
          </div>

          {/* System status block */}
          <div className="mt-2 border-2 border-black flex items-center justify-between p-3.5 bg-zinc-950 text-white rounded shadow-sm">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full border border-white block ${
                systemState === 'STABLE' ? 'bg-emerald-400 animate-pulse' :
                systemState === 'CHOKED' ? 'bg-yellow-400 animate-ping' : 'bg-red-500 animate-bounce'
              }`} />
              <div className="leading-none">
                <span className="text-[9px] uppercase tracking-wide opacity-50 block font-mono">Telemetry Status</span>
                <span className="font-heading text-xs font-black uppercase tracking-wider block mt-0.5">
                  CLUSTER_NODE_{systemState}
                </span>
              </div>
            </div>
            <div className="font-mono text-[10px] pr-2 uppercase select-none opacity-40">
              Region: us-east-1
            </div>
          </div>

        </div>
      </div>

      {/* Terminal Real-Time Logging Console */}
      <div className="border-t-2 border-black bg-zinc-950 text-zinc-100 p-2 font-mono text-[10px] md:text-xs">
        <div className="flex justify-between items-center bg-zinc-900 border border-black py-1 px-3 mb-2 font-bold select-none text-[9px] uppercase text-slate-400 tracking-wider">
          <span>🖥️ Live Transaction Feed Telemetry (Chronological Logs)</span>
          <span className="animate-pulse text-[#FFE600] font-black">● LIVE SOCKET</span>
        </div>
        <div ref={logsContainerRef} className="p-3 bg-zinc-950 text-[#c2dfb8] h-48 overflow-y-auto flex flex-col gap-1.5 custom-scrollbar font-bold border border-zinc-900 leading-snug rounded-sm select-text">
          {logs.map((log, index) => (
            <div key={index} className="flex gap-2.5 items-start">
              <ChevronRight className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0 mt-0.5 select-none" />
              <span className={`${
                log.includes("LOST WRITE") || log.includes("EXCEPTION") || log.includes("Error") ? "text-rose-400 animate-pulse" :
                log.includes("concurrency") || log.includes("STAMPEDE") ? "text-amber-400 font-extrabold" :
                log.includes("Success") || log.includes("reconciled") || log.includes("successful") ? "text-emerald-400" :
                log.includes("[User Click]") ? "text-sky-300 font-extrabold" : "text-slate-300"
              }`}>
                {log}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
