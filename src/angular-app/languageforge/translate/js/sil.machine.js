/**
 * @version 1.0.0.0
 * @copyright Copyright ©  2016
 * @compiler Bridge.NET 15.7.0
 */
Bridge.assembly("SIL.Machine", function ($asm, globals) {
    "use strict";

    Bridge.define("SIL.Machine.Annotations.SpanFactory$1", function (TOffset) { return {
        _includeEndpoint: false,
        _comparer: null,
        _equalityComparer: null,
        ctor: function () {
            SIL.Machine.Annotations.SpanFactory$1(TOffset).$ctor1.call(this, false);
        },
        $ctor1: function (includeEndpoint) {
            SIL.Machine.Annotations.SpanFactory$1(TOffset).$ctor2.call(this, includeEndpoint, new (System.Collections.Generic.Comparer$1(TOffset))(System.Collections.Generic.Comparer$1.$default.fn), System.Collections.Generic.EqualityComparer$1(TOffset).def);
        },
        $ctor2: function (includeEndpoint, comparer, equalityComparer) {
            this.$initialize();
            this._includeEndpoint = includeEndpoint;
            this._comparer = comparer;
            this._equalityComparer = equalityComparer;
        },
        getIncludeEndpoint: function () {
            return this._includeEndpoint;
        },
        getComparer: function () {
            return this._comparer;
        },
        getEqualityComparer: function () {
            return this._equalityComparer;
        },
        calcLength$1: function (start, end, dir) {
            var actualStart;
            var actualEnd;
            if (dir === SIL.Machine.DataStructures.Direction.LeftToRight) {
                actualStart = start;
                actualEnd = end;
            } else {
                actualStart = end;
                actualEnd = start;
            }

            return this.calcLength(actualStart, actualEnd);
        },
        isValidSpan: function (start, end) {
            return this.isValidSpan$1(start, end, SIL.Machine.DataStructures.Direction.LeftToRight);
        },
        isValidSpan$1: function (start, end, dir) {
            var actualStart;
            var actualEnd;
            if (dir === SIL.Machine.DataStructures.Direction.LeftToRight) {
                actualStart = start;
                actualEnd = end;
            } else {
                actualStart = end;
                actualEnd = start;
            }

            var compare = this._comparer["System$Collections$Generic$IComparer$1$" + Bridge.getTypeAlias(TOffset) + "$compare"](actualStart, actualEnd);
            return this._includeEndpoint ? compare <= 0 : compare < 0;
        },
        isRange$1: function (start, end, dir) {
            var actualStart;
            var actualEnd;
            if (dir === SIL.Machine.DataStructures.Direction.LeftToRight) {
                actualStart = start;
                actualEnd = end;
            } else {
                actualStart = end;
                actualEnd = start;
            }

            return this.isRange(actualStart, actualEnd);
        },
        create$1: function (start, end) {
            return this.create$2(start, end, SIL.Machine.DataStructures.Direction.LeftToRight);
        },
        create$2: function (start, end, dir) {
            var actualStart;
            var actualEnd;
            if (dir === SIL.Machine.DataStructures.Direction.LeftToRight) {
                actualStart = start;
                actualEnd = end;
            } else {
                actualStart = end;
                actualEnd = start;
            }

            if (!this.isValidSpan(actualStart, actualEnd)) {
                throw new System.ArgumentException("The start offset is greater than the end offset.", "start");
            }

            return new (SIL.Machine.Annotations.Span$1(TOffset)).$ctor2(this, actualStart, actualEnd);
        },
        create: function (offset) {
            return this.create$3(offset, SIL.Machine.DataStructures.Direction.LeftToRight);
        }
    }; });

    Bridge.define("SIL.Machine.Annotations.Span$1", function (TOffset) { return {
        inherits: function () { return [System.IComparable$1(SIL.Machine.Annotations.Span$1(TOffset)),System.IComparable,System.IEquatable$1(SIL.Machine.Annotations.Span$1(TOffset))]; },
        $kind: "struct",
        statics: {
            op_Equality: function (x, y) {
                return x.equalsT(y);
            },
            op_Inequality: function (x, y) {
                return !(SIL.Machine.Annotations.Span$1(TOffset).op_Equality(x, y));
            },
            getDefaultValue: function () { return new (SIL.Machine.Annotations.Span$1(TOffset))(); }
        },
        _spanFactory: null,
        _start: Bridge.getDefaultValue(TOffset),
        _end: Bridge.getDefaultValue(TOffset),
        config: {
            alias: [
            "compareTo", "System$IComparable$1$SIL$Machine$Annotations$Span$1$" + Bridge.getTypeAlias(TOffset) + "$compareTo",
            "compareTo$1", "System$IComparable$compareTo",
            "equalsT", "System$IEquatable$1$SIL$Machine$Annotations$Span$1$" + Bridge.getTypeAlias(TOffset) + "$equalsT"
            ]
        },
        $ctor2: function (spanFactory, start, end) {
            this.$initialize();
            this._spanFactory = spanFactory;
            this._start = start;
            this._end = end;
        },
        $ctor1: function (span) {
            SIL.Machine.Annotations.Span$1(TOffset).$ctor2.call(this, span._spanFactory, span._start, span._end);
        },
        ctor: function () {
            this.$initialize();
        },
        getSpanFactory: function () {
            return this._spanFactory;
        },
        getIsEmpty: function () {
            return SIL.Machine.Annotations.Span$1(TOffset).op_Equality(this._spanFactory.getEmpty(), this);
        },
        getStart: function () {
            return this._start;
        },
        getEnd: function () {
            return this._end;
        },
        getLength: function () {
            return this._spanFactory.calcLength(this._start, this._end);
        },
        getIsRange: function () {
            return this._spanFactory.isRange(this._start, this._end);
        },
        getStart$1: function (dir) {
            return dir === SIL.Machine.DataStructures.Direction.LeftToRight ? this._start : this._end;
        },
        getEnd$1: function (dir) {
            return dir === SIL.Machine.DataStructures.Direction.LeftToRight ? this._end : this._start;
        },
        overlaps$2: function (other) {
            return (this._spanFactory.getIncludeEndpoint() ? this._spanFactory.getComparer()["System$Collections$Generic$IComparer$1$" + Bridge.getTypeAlias(TOffset) + "$compare"](this._start, other._end) <= 0 : this._spanFactory.getComparer()["System$Collections$Generic$IComparer$1$" + Bridge.getTypeAlias(TOffset) + "$compare"](this._start, other._end) < 0) && (this._spanFactory.getIncludeEndpoint() ? this._spanFactory.getComparer()["System$Collections$Generic$IComparer$1$" + Bridge.getTypeAlias(TOffset) + "$compare"](this._end, other._start) >= 0 : this._spanFactory.getComparer()["System$Collections$Generic$IComparer$1$" + Bridge.getTypeAlias(TOffset) + "$compare"](this._end, other._start) > 0);
        },
        overlaps: function (start, end) {
            return this.overlaps$1(start, end, SIL.Machine.DataStructures.Direction.LeftToRight);
        },
        overlaps$1: function (start, end, dir) {
            return this.overlaps$2(this._spanFactory.create$2(start, end, dir));
        },
        contains$4: function (other) {
            return this._spanFactory.getComparer()["System$Collections$Generic$IComparer$1$" + Bridge.getTypeAlias(TOffset) + "$compare"](this._start, other._start) <= 0 && this._spanFactory.getComparer()["System$Collections$Generic$IComparer$1$" + Bridge.getTypeAlias(TOffset) + "$compare"](this._end, other._end) >= 0;
        },
        contains: function (offset) {
            return this.contains$3(offset, SIL.Machine.DataStructures.Direction.LeftToRight);
        },
        contains$3: function (offset, dir) {
            return this.contains$4(this._spanFactory.create$3(offset, dir));
        },
        contains$1: function (start, end) {
            return this.contains$2(start, end, SIL.Machine.DataStructures.Direction.LeftToRight);
        },
        contains$2: function (start, end, dir) {
            return this.contains$4(this._spanFactory.create$2(start, end, dir));
        },
        compareTo: function (other) {
            var res = this._spanFactory.getComparer()["System$Collections$Generic$IComparer$1$" + Bridge.getTypeAlias(TOffset) + "$compare"](this._start, other._start);
            if (res === 0) {
                res = (-this._spanFactory.getComparer()["System$Collections$Generic$IComparer$1$" + Bridge.getTypeAlias(TOffset) + "$compare"](this._end, other._end)) | 0;
            }
            return res;
        },
        compareTo$1: function (other) {
            if (!(Bridge.is(other, SIL.Machine.Annotations.Span$1(TOffset)))) {
                throw new System.ArgumentException();
            }
            return this.compareTo(System.Nullable.getValue(Bridge.cast(other, SIL.Machine.Annotations.Span$1(TOffset))));
        },
        getHashCode: function () {
            var code = 23;
            code = (((code * 31) | 0) + (this._start == null ? 0 : this._spanFactory.getEqualityComparer()["System$Collections$Generic$IEqualityComparer$1$" + Bridge.getTypeAlias(TOffset) + "$getHashCode2"](this._start))) | 0;
            code = (((code * 31) | 0) + (this._end == null ? 0 : this._spanFactory.getEqualityComparer()["System$Collections$Generic$IEqualityComparer$1$" + Bridge.getTypeAlias(TOffset) + "$getHashCode2"](this._end))) | 0;
            return code;
        },
        equals: function (obj) {
            return Bridge.is(obj, SIL.Machine.Annotations.Span$1(TOffset)) && this.equalsT(System.Nullable.getValue(Bridge.cast(obj, SIL.Machine.Annotations.Span$1(TOffset))));
        },
        equalsT: function (other) {
            return this._spanFactory.getEqualityComparer()["System$Collections$Generic$IEqualityComparer$1$" + Bridge.getTypeAlias(TOffset) + "$equals2"](this._start, other._start) && this._spanFactory.getEqualityComparer()["System$Collections$Generic$IEqualityComparer$1$" + Bridge.getTypeAlias(TOffset) + "$equals2"](this._end, other._end);
        },
        toString: function () {
            return System.String.format("[{0}, {1}]", this._start, this._end);
        },
        $clone: function (to) {
            var s = to || new (SIL.Machine.Annotations.Span$1(TOffset))();
            s._spanFactory = this._spanFactory;
            s._start = this._start;
            s._end = this._end;
            return s;
        }
    }; });

    Bridge.define("SIL.Machine.DataStructures.Direction", {
        $kind: "enum",
        statics: {
            LeftToRight: 0,
            RightToLeft: 1
        }
    });

    Bridge.define("SIL.Machine.Tokenization.DetokenizeOperation", {
        $kind: "enum",
        statics: {
            NoOperation: 0,
            MergeLeft: 1,
            MergeRight: 2,
            MergeRightFirstLeftSecond: 3
        }
    });

    Bridge.definei("SIL.Machine.Tokenization.IDetokenizer$2", function (TData, TToken) { return {
        $kind: "interface",
        $variance: [1,2]
    }; });

    Bridge.definei("SIL.Machine.Tokenization.ITokenizer$2", function (TData, TOffset) { return {
        $kind: "interface",
        $variance: [2,0]
    }; });

    Bridge.define("SIL.Machine.Tokenization.TokenizationExtensions", {
        statics: {
            tokenizeToStrings: function (tokenizer, str) {
                return System.Linq.Enumerable.from(tokenizer.SIL$Machine$Tokenization$ITokenizer$2$String$System$Int32$tokenize(str)).select(function (span) {
                        return str.substr(span.getStart(), span.getLength());
                    });
            }
        }
    });

    Bridge.define("SIL.Machine.Translation.AlignmentType", {
        $kind: "enum",
        statics: {
            Unknown: -1,
            NotAligned: 0,
            Aligned: 1
        }
    });

    Bridge.define("SIL.Machine.Translation.EcmScoreInfo", {
        config: {
            properties: {
                Scores: null,
                Operations: null
            },
            init: function () {
                this.Scores = new (System.Collections.Generic.List$1(System.Double))();
                this.Operations = new (System.Collections.Generic.List$1(SIL.Machine.Translation.EditOperation))();
            }
        },
        updatePositions: function (prevEsi, positions) {
            while (System.Array.getCount(this.getScores(), System.Double) < System.Array.getCount(prevEsi.getScores(), System.Double)) {
                System.Array.add(this.getScores(), 0, System.Double);
            }

            while (System.Array.getCount(this.getOperations(), SIL.Machine.Translation.EditOperation) < System.Array.getCount(prevEsi.getOperations(), SIL.Machine.Translation.EditOperation)) {
                System.Array.add(this.getOperations(), 0, SIL.Machine.Translation.EditOperation);
            }

            for (var i = 0; i < System.Array.getCount(positions, System.Int32); i = (i + 1) | 0) {
                System.Array.setItem(this.getScores(), System.Array.getItem(positions, i, System.Int32), System.Array.getItem(prevEsi.getScores(), System.Array.getItem(positions, i, System.Int32), System.Double), System.Double);
                if (System.Array.getCount(prevEsi.getOperations(), SIL.Machine.Translation.EditOperation) > i) {
                    System.Array.setItem(this.getOperations(), System.Array.getItem(positions, i, System.Int32), System.Array.getItem(prevEsi.getOperations(), System.Array.getItem(positions, i, System.Int32), SIL.Machine.Translation.EditOperation), SIL.Machine.Translation.EditOperation);
                }
            }
        },
        removeLast: function () {
            if (System.Array.getCount(this.getScores(), System.Double) > 1) {
                System.Array.removeAt(this.getScores(), ((System.Array.getCount(this.getScores(), System.Double) - 1) | 0), System.Double);
            }
            if (System.Array.getCount(this.getOperations(), SIL.Machine.Translation.EditOperation) > 1) {
                System.Array.removeAt(this.getOperations(), ((System.Array.getCount(this.getOperations(), SIL.Machine.Translation.EditOperation) - 1) | 0), SIL.Machine.Translation.EditOperation);
            }
        },
        getLastInsPrefixWordFromEsi: function () {
            var results = System.Array.init(System.Array.getCount(this.getOperations(), SIL.Machine.Translation.EditOperation), 0, System.Int32);

            for (var j = (System.Array.getCount(this.getOperations(), SIL.Machine.Translation.EditOperation) - 1) | 0; j >= 0; j = (j - 1) | 0) {
                switch (System.Array.getItem(this.getOperations(), j, SIL.Machine.Translation.EditOperation)) {
                    case SIL.Machine.Translation.EditOperation.Hit: 
                        results[j] = (j - 1) | 0;
                        break;
                    case SIL.Machine.Translation.EditOperation.Insert: 
                        var tj = j;
                        while (tj >= 0 && System.Array.getItem(this.getOperations(), tj, SIL.Machine.Translation.EditOperation) === SIL.Machine.Translation.EditOperation.Insert) {
                            tj = (tj - 1) | 0;
                        }
                        if (System.Array.getItem(this.getOperations(), tj, SIL.Machine.Translation.EditOperation) === SIL.Machine.Translation.EditOperation.Hit || System.Array.getItem(this.getOperations(), tj, SIL.Machine.Translation.EditOperation) === SIL.Machine.Translation.EditOperation.Substitute) {
                            tj = (tj - 1) | 0;
                        }
                        results[j] = tj;
                        break;
                    case SIL.Machine.Translation.EditOperation.Delete: 
                        results[j] = j;
                        break;
                    case SIL.Machine.Translation.EditOperation.Substitute: 
                        results[j] = (j - 1) | 0;
                        break;
                    case SIL.Machine.Translation.EditOperation.None: 
                        results[j] = 0;
                        break;
                }
            }

            return results;
        }
    });

    Bridge.define("SIL.Machine.Translation.EditDistance$2", function (TSeq, TItem) { return {
        config: {
            properties: {
                HitCost: 0,
                InsertionCost: 0,
                SubstitutionCost: 0,
                DeletionCost: 0
            }
        },
        compute: function (x, y) {
            return this.compute$3(x, y, true, false);
        },
        compute$1: function (x, y, ops) {
            return this.compute$4(x, y, true, false, ops);
        },
        compute$3: function (x, y, isLastItemComplete, usePrefixDelOp) {
            var distMatrix = { };
            return this.compute$2(x, y, isLastItemComplete, usePrefixDelOp, distMatrix);
        },
        compute$4: function (x, y, isLastItemComplete, usePrefixDelOp, ops) {
            var distMatrix = { };
            var dist = this.compute$2(x, y, isLastItemComplete, usePrefixDelOp, distMatrix);
            ops.v = System.Linq.Enumerable.from(this.getOperations(x, y, distMatrix.v, isLastItemComplete, usePrefixDelOp, this.getCount(x), this.getCount(y))).toArray();
            return dist;
        },
        compute$2: function (x, y, isLastItemComplete, usePrefixDelOp, distMatrix) {
            distMatrix.v = this.initDistMatrix(x, y);

            var xCount = this.getCount(x);
            var yCount = this.getCount(y);
            for (var i = 0; i <= xCount; i = (i + 1) | 0) {
                for (var j = 0; j <= yCount; j = (j + 1) | 0) {
                    var iPred = { }, jPred = { };
                    var op = { v : new SIL.Machine.Translation.EditOperation() };
                    distMatrix.v.set([i, j], this.processMatrixCell(x, y, distMatrix.v, usePrefixDelOp, j !== yCount || isLastItemComplete, i, j, iPred, jPred, op));
                }
            }

            return distMatrix.v.get([xCount, yCount]);
        },
        computePrefix: function (x, y, isLastItemComplete, usePrefixDelOp, ops) {
            return this.compute$4(x, y, isLastItemComplete, usePrefixDelOp, ops);
        },
        initDistMatrix: function (x, y) {
            var xCount = this.getCount(x);
            var yCount = this.getCount(y);
            var dim = Math.max(xCount, yCount);
            var distMatrix = System.Array.create(0, null, System.Double, ((dim + 1) | 0), ((dim + 1) | 0));
            return distMatrix;
        },
        getOperations: function (x, y, distMatrix, isLastItemComplete, usePrefixDelOp, i, j) {
            i = {v:i};
            j = {v:j};
            var yCount = this.getCount(y);
            var ops = new (System.Collections.Generic.Stack$1(SIL.Machine.Translation.EditOperation)).ctor();
            while (i.v > 0 || j.v > 0) {
                var op = { v : new SIL.Machine.Translation.EditOperation() };
                this.processMatrixCell(x, y, distMatrix, usePrefixDelOp, j.v !== yCount || isLastItemComplete, i.v, j.v, i, j, op);
                if (op.v !== SIL.Machine.Translation.EditOperation.PrefixDelete) {
                    ops.push(op.v);
                }
            }
            return ops;
        },
        processMatrixCell: function (x, y, distMatrix, usePrefixDelOp, isComplete, i, j, iPred, jPred, op) {
            if (i !== 0 && j !== 0) {
                var xItem = this.getItem(x, ((i - 1) | 0));
                var yItem = this.getItem(y, ((j - 1) | 0));
                var substCost;
                if (this.isHit(xItem, yItem, isComplete)) {
                    substCost = this.getHitCost$1(xItem, yItem, isComplete);
                    op.v = SIL.Machine.Translation.EditOperation.Hit;
                } else {
                    substCost = this.getSubstitutionCost$1(xItem, yItem, isComplete);
                    op.v = SIL.Machine.Translation.EditOperation.Substitute;
                }

                var cost = distMatrix.get([((i - 1) | 0), ((j - 1) | 0)]) + substCost;
                var min = cost;
                iPred.v = (i - 1) | 0;
                jPred.v = (j - 1) | 0;

                var delCost = usePrefixDelOp && j === this.getCount(y) ? 0 : this.getDeletionCost$1(xItem);
                cost = distMatrix.get([((i - 1) | 0), j]) + delCost;
                if (cost < min) {
                    min = cost;
                    iPred.v = (i - 1) | 0;
                    jPred.v = j;
                    op.v = delCost === 0 ? SIL.Machine.Translation.EditOperation.PrefixDelete : SIL.Machine.Translation.EditOperation.Delete;
                }

                cost = distMatrix.get([i, ((j - 1) | 0)]) + this.getInsertionCost$1(yItem);
                if (cost < min) {
                    min = cost;
                    iPred.v = i;
                    jPred.v = (j - 1) | 0;
                    op.v = SIL.Machine.Translation.EditOperation.Insert;
                }

                return min;
            }

            if (i === 0 && j === 0) {
                iPred.v = 0;
                jPred.v = 0;
                op.v = SIL.Machine.Translation.EditOperation.None;
                return 0;
            }

            if (i === 0) {
                iPred.v = 0;
                jPred.v = (j - 1) | 0;
                op.v = SIL.Machine.Translation.EditOperation.Insert;
                return distMatrix.get([0, ((j - 1) | 0)]) + this.getInsertionCost$1(this.getItem(y, ((j - 1) | 0)));
            }

            iPred.v = (i - 1) | 0;
            jPred.v = 0;
            op.v = SIL.Machine.Translation.EditOperation.Delete;
            return distMatrix.get([((i - 1) | 0), 0]) + this.getDeletionCost$1(this.getItem(x, ((i - 1) | 0)));
        }
    }; });

    Bridge.define("SIL.Machine.Translation.EditOperation", {
        $kind: "enum",
        statics: {
            None: 0,
            Hit: 1,
            Insert: 2,
            Delete: 3,
            PrefixDelete: 4,
            Substitute: 5
        }
    });

    Bridge.define("SIL.Machine.Translation.ErrorCorrectionModel", {
        _segmentEditDistance: null,
        ctor: function () {
            this.$initialize();
            this._segmentEditDistance = new SIL.Machine.Translation.SegmentEditDistance();
            this.setErrorModelParameters(128, 0.8, 1, 1, 1);
        },
        setErrorModelParameters: function (vocSize, hitProb, insFactor, substFactor, delFactor) {
            var e;
            if (vocSize === 0) {
                e = (1 - hitProb) / (insFactor + substFactor + delFactor);
            } else {
                e = (1 - hitProb) / ((insFactor * vocSize) + (substFactor * (((vocSize - 1) | 0))) + delFactor);
            }

            var insProb = e * insFactor;
            var substProb = e * substFactor;
            var delProb = e * delFactor;

            this._segmentEditDistance.setHitCost(-Bridge.Math.log(hitProb));
            this._segmentEditDistance.setInsertionCost(-Bridge.Math.log(insProb));
            this._segmentEditDistance.setSubstitutionCost(-Bridge.Math.log(substProb));
            this._segmentEditDistance.setDeletionCost(-Bridge.Math.log(delProb));
        },
        setupInitialEsi: function (initialEsi) {
            var score = this._segmentEditDistance.compute(System.Array.init(0, null, String), System.Array.init(0, null, String));
            System.Array.clear(initialEsi.getScores(), System.Double);
            System.Array.add(initialEsi.getScores(), score, System.Double);
            System.Array.clear(initialEsi.getOperations(), SIL.Machine.Translation.EditOperation);
        },
        setupEsi: function (esi, prevEsi, word) {
            var score = this._segmentEditDistance.compute(System.Array.init([word], String), System.Array.init(0, null, String));
            System.Array.clear(esi.getScores(), System.Double);
            System.Array.add(esi.getScores(), System.Array.getItem(prevEsi.getScores(), 0, System.Double) + score, System.Double);
            System.Array.clear(esi.getOperations(), SIL.Machine.Translation.EditOperation);
            System.Array.add(esi.getOperations(), SIL.Machine.Translation.EditOperation.None, SIL.Machine.Translation.EditOperation);
        },
        extendInitialEsi: function (initialEsi, prevInitialEsi, prefixDiff) {
            this._segmentEditDistance.incrComputePrefixFirstRow(initialEsi.getScores(), prevInitialEsi.getScores(), prefixDiff);
        },
        extendEsi: function (esi, prevEsi, word, prefixDiff, isLastWordComplete) {
            var $t;
            var ops = this._segmentEditDistance.incrComputePrefix(esi.getScores(), prevEsi.getScores(), word, prefixDiff, isLastWordComplete);
            $t = Bridge.getEnumerator(ops, SIL.Machine.Translation.EditOperation);
            while ($t.moveNext()) {
                var op = $t.getCurrent();
                System.Array.add(esi.getOperations(), op, SIL.Machine.Translation.EditOperation);
            }
        },
        correctPrefix: function (correction, uncorrectedPrefixLen, prefix, isLastWordComplete) {
            var $t;
            if (uncorrectedPrefixLen === 0) {
                $t = Bridge.getEnumerator(prefix, String);
                while ($t.moveNext()) {
                    var w = $t.getCurrent();
                    System.Array.add(correction.getTarget(), w, String);
                    System.Array.add(correction.getTargetConfidences(), -1, System.Double);
                }
                return System.Array.getCount(prefix, String);
            }

            var wordOps = { }, charOps = { };
            this._segmentEditDistance.computePrefix$1(System.Linq.Enumerable.from(correction.getTarget()).take(uncorrectedPrefixLen).toArray(), prefix, isLastWordComplete, false, wordOps, charOps);
            return this.correctPrefix$1(correction, wordOps.v, charOps.v, prefix, isLastWordComplete);
        },
        correctPrefix$1: function (correction, wordOps, charOps, prefix, isLastWordComplete) {
            var $t;
            var alignmentColsToCopy = new (System.Collections.Generic.List$1(System.Int32))();

            var i = 0, j = 0, k = 0;
            $t = Bridge.getEnumerator(wordOps, SIL.Machine.Translation.EditOperation);
            while ($t.moveNext()) {
                var wordOp = $t.getCurrent();
                switch (wordOp) {
                    case SIL.Machine.Translation.EditOperation.Insert: 
                        System.Array.insert(correction.getTarget(), j, System.Array.getItem(prefix, j, String), String);
                        System.Array.insert(correction.getTargetConfidences(), j, -1, System.Double);
                        alignmentColsToCopy.add(-1);
                        for (var l = k; l < System.Array.getCount(correction.getPhrases(), SIL.Machine.Translation.PhraseInfo); l = (l + 1) | 0) {
                            System.Array.getItem(correction.getPhrases(), l, SIL.Machine.Translation.PhraseInfo).setTargetCut((System.Array.getItem(correction.getPhrases(), l, SIL.Machine.Translation.PhraseInfo).getTargetCut() + 1) | 0);
                        }
                        j = (j + 1) | 0;
                        break;
                    case SIL.Machine.Translation.EditOperation.Delete: 
                        System.Array.removeAt(correction.getTarget(), j, String);
                        System.Array.removeAt(correction.getTargetConfidences(), j, System.Double);
                        i = (i + 1) | 0;
                        if (k < System.Array.getCount(correction.getPhrases(), SIL.Machine.Translation.PhraseInfo)) {
                            for (var l1 = k; l1 < System.Array.getCount(correction.getPhrases(), SIL.Machine.Translation.PhraseInfo); l1 = (l1 + 1) | 0) {
                                System.Array.getItem(correction.getPhrases(), l1, SIL.Machine.Translation.PhraseInfo).setTargetCut((System.Array.getItem(correction.getPhrases(), l1, SIL.Machine.Translation.PhraseInfo).getTargetCut() - 1) | 0);
                            }

                            if (System.Array.getItem(correction.getPhrases(), k, SIL.Machine.Translation.PhraseInfo).getTargetCut() < 0 || (k > 0 && System.Array.getItem(correction.getPhrases(), k, SIL.Machine.Translation.PhraseInfo).getTargetCut() === System.Array.getItem(correction.getPhrases(), ((k - 1) | 0), SIL.Machine.Translation.PhraseInfo).getTargetCut())) {
                                System.Array.removeAt(correction.getPhrases(), k, SIL.Machine.Translation.PhraseInfo);
                                alignmentColsToCopy.clear();
                                i = 0;
                            } else if (j > System.Array.getItem(correction.getPhrases(), k, SIL.Machine.Translation.PhraseInfo).getTargetCut()) {
                                this.resizeAlignment(correction, k, alignmentColsToCopy);
                                alignmentColsToCopy.clear();
                                i = 0;
                                k = (k + 1) | 0;
                            }
                        }
                        break;
                    case SIL.Machine.Translation.EditOperation.Hit: 
                    case SIL.Machine.Translation.EditOperation.Substitute: 
                        if (wordOp === SIL.Machine.Translation.EditOperation.Substitute || j < ((System.Array.getCount(prefix, String) - 1) | 0) || isLastWordComplete) {
                            System.Array.setItem(correction.getTarget(), j, System.Array.getItem(prefix, j, String), String);
                        } else {
                            System.Array.setItem(correction.getTarget(), j, this.correctWord(charOps, System.Array.getItem(correction.getTarget(), j, String), System.Array.getItem(prefix, j, String)), String);
                        }
                        if (wordOp === SIL.Machine.Translation.EditOperation.Substitute) {
                            System.Array.setItem(correction.getTargetConfidences(), j, -1, System.Double);
                        } else {
                            if (wordOp === SIL.Machine.Translation.EditOperation.Hit) {
                                correction.getTargetUncorrectedPrefixWords().System$Collections$Generic$ISet$1$System$Int32$add(j);
                            }
                        }
                        alignmentColsToCopy.add(i);
                        i = (i + 1) | 0;
                        j = (j + 1) | 0;
                        if (k < System.Array.getCount(correction.getPhrases(), SIL.Machine.Translation.PhraseInfo) && j > System.Array.getItem(correction.getPhrases(), k, SIL.Machine.Translation.PhraseInfo).getTargetCut()) {
                            this.resizeAlignment(correction, k, alignmentColsToCopy);
                            alignmentColsToCopy.clear();
                            i = 0;
                            k = (k + 1) | 0;
                        }
                        break;
                }
            }

            while (j < System.Array.getCount(correction.getTarget(), String)) {
                alignmentColsToCopy.add(i);

                i = (i + 1) | 0;
                j = (j + 1) | 0;
                if (k < System.Array.getCount(correction.getPhrases(), SIL.Machine.Translation.PhraseInfo) && j > System.Array.getItem(correction.getPhrases(), k, SIL.Machine.Translation.PhraseInfo).getTargetCut()) {
                    this.resizeAlignment(correction, k, alignmentColsToCopy);
                    alignmentColsToCopy.clear();
                    break;
                }
            }

            return alignmentColsToCopy.getCount();
        },
        resizeAlignment: function (correction, phraseIndex, colsToCopy) {
            var curAlignment = System.Array.getItem(correction.getPhrases(), phraseIndex, SIL.Machine.Translation.PhraseInfo).getAlignment();
            if (System.Array.getCount(colsToCopy, System.Int32) === curAlignment.getColumnCount()) {
                return;
            }

            var newAlignment = new SIL.Machine.Translation.WordAlignmentMatrix.$ctor1(curAlignment.getRowCount(), System.Array.getCount(colsToCopy, System.Int32));
            for (var j = 0; j < newAlignment.getColumnCount(); j = (j + 1) | 0) {
                if (System.Array.getItem(colsToCopy, j, System.Int32) !== -1) {
                    for (var i = 0; i < newAlignment.getRowCount(); i = (i + 1) | 0) {
                        newAlignment.setItem(i, j, curAlignment.getItem(i, System.Array.getItem(colsToCopy, j, System.Int32)));
                    }
                }
            }

            System.Array.getItem(correction.getPhrases(), phraseIndex, SIL.Machine.Translation.PhraseInfo).setAlignment(newAlignment);
        },
        correctWord: function (charOps, word, prefix) {
            var $t;
            var sb = new System.Text.StringBuilder();
            var i = 0, j = 0;
            $t = Bridge.getEnumerator(charOps, SIL.Machine.Translation.EditOperation);
            while ($t.moveNext()) {
                var charOp = $t.getCurrent();
                switch (charOp) {
                    case SIL.Machine.Translation.EditOperation.Hit: 
                        sb.append(String.fromCharCode(word.charCodeAt(i)));
                        i = (i + 1) | 0;
                        j = (j + 1) | 0;
                        break;
                    case SIL.Machine.Translation.EditOperation.Insert: 
                        sb.append(String.fromCharCode(prefix.charCodeAt(j)));
                        j = (j + 1) | 0;
                        break;
                    case SIL.Machine.Translation.EditOperation.Delete: 
                        i = (i + 1) | 0;
                        break;
                    case SIL.Machine.Translation.EditOperation.Substitute: 
                        sb.append(String.fromCharCode(prefix.charCodeAt(j)));
                        i = (i + 1) | 0;
                        j = (j + 1) | 0;
                        break;
                }
            }

            sb.append(word.substr(i));
            return sb.toString();
        }
    });

    Bridge.define("SIL.Machine.Translation.ErrorCorrectionWordGraphProcessor", {
        statics: {
            addToNBestList: function (T, nbestList, n, item) {
                var index = nbestList.binarySearch(item);
                if (index < 0) {
                    index = ~index;
                } else {
                    index = (index + 1) | 0;
                }
                if (nbestList.getCount() < n) {
                    nbestList.insert(index, item);
                } else if (index < nbestList.getCount()) {
                    nbestList.insert(index, item);
                    nbestList.removeAt(((nbestList.getCount() - 1) | 0));
                }
            }
        },
        _wordGraph: null,
        _restScores: null,
        _ecm: null,
        _stateEcmScoreInfos: null,
        _arcEcmScoreInfos: null,
        _stateBestScores: null,
        _stateWordGraphScores: null,
        _stateBestPrevArcs: null,
        _statesInvolvedInArcs: null,
        _prevPrefix: null,
        _prevIsLastWordComplete: false,
        config: {
            properties: {
                EcmWeight: 0,
                WordGraphWeight: 0
            }
        },
        ctor: function (ecm, wordGraph, ecmWeight, wordGraphWeight) {
            if (ecmWeight === void 0) { ecmWeight = 1.0; }
            if (wordGraphWeight === void 0) { wordGraphWeight = 1.0; }

            this.$initialize();
            this._ecm = ecm;
            this._wordGraph = wordGraph;
            this.setEcmWeight(ecmWeight);
            this.setWordGraphWeight(wordGraphWeight);

            this._restScores = System.Linq.Enumerable.from(this._wordGraph.computeRestScores()).toArray();
            this._stateEcmScoreInfos = new (System.Collections.Generic.List$1(SIL.Machine.Translation.EcmScoreInfo))();
            this._arcEcmScoreInfos = new (System.Collections.Generic.List$1(System.Collections.Generic.List$1(SIL.Machine.Translation.EcmScoreInfo)))();
            this._stateBestScores = new (System.Collections.Generic.List$1(System.Collections.Generic.List$1(System.Double)))();
            this._stateWordGraphScores = new (System.Collections.Generic.List$1(System.Double))();
            this._stateBestPrevArcs = new (System.Collections.Generic.List$1(System.Collections.Generic.List$1(System.Int32)))();
            this._statesInvolvedInArcs = new (System.Collections.Generic.HashSet$1(System.Int32)).ctor();
            this._prevPrefix = System.Array.init(0, null, String);

            this.initStates();
            this.initArcs();
        },
        initStates: function () {
            for (var i = 0; i < this._wordGraph.getStateCount(); i = (i + 1) | 0) {
                this._stateEcmScoreInfos.add(new SIL.Machine.Translation.EcmScoreInfo());
                this._stateWordGraphScores.add(0);
                this._stateBestScores.add(new (System.Collections.Generic.List$1(System.Double))());
                this._stateBestPrevArcs.add(new (System.Collections.Generic.List$1(System.Int32))());
            }

            if (!this._wordGraph.getIsEmpty()) {
                this._ecm.setupInitialEsi(this._stateEcmScoreInfos.getItem(SIL.Machine.Translation.WordGraph.InitialState));
                this.updateInitialStateBestScores();
            }
        },
        initArcs: function () {
            var $t;
            for (var arcIndex = 0; arcIndex < System.Array.getCount(this._wordGraph.getArcs(), SIL.Machine.Translation.WordGraphArc); arcIndex = (arcIndex + 1) | 0) {
                var arc = System.Array.getItem(this._wordGraph.getArcs(), arcIndex, SIL.Machine.Translation.WordGraphArc);

                // init ecm score info for each word of arc
                var prevEsi = this._stateEcmScoreInfos.getItem(arc.getPrevState());
                var esis = new (System.Collections.Generic.List$1(SIL.Machine.Translation.EcmScoreInfo))();
                $t = Bridge.getEnumerator(arc.getWords(), String);
                while ($t.moveNext()) {
                    var word = $t.getCurrent();
                    var esi = new SIL.Machine.Translation.EcmScoreInfo();
                    this._ecm.setupEsi(esi, prevEsi, word);
                    esis.add(esi);
                    prevEsi = esi;
                }
                this._arcEcmScoreInfos.add(esis);

                // init best scores for the arc's successive state
                this.updateStateBestScores(arcIndex, 0);

                this._statesInvolvedInArcs.add(arc.getPrevState());
                this._statesInvolvedInArcs.add(arc.getNextState());
            }
        },
        updateInitialStateBestScores: function () {
            var $t;
            var esi = this._stateEcmScoreInfos.getItem(SIL.Machine.Translation.WordGraph.InitialState);

            this._stateWordGraphScores.setItem(SIL.Machine.Translation.WordGraph.InitialState, this._wordGraph.getInitialStateScore());

            var bestScores = this._stateBestScores.getItem(SIL.Machine.Translation.WordGraph.InitialState);
            var bestPrevArcs = this._stateBestPrevArcs.getItem(SIL.Machine.Translation.WordGraph.InitialState);

            bestScores.clear();
            bestPrevArcs.clear();

            $t = Bridge.getEnumerator(esi.getScores(), System.Double);
            while ($t.moveNext()) {
                var score = $t.getCurrent();
                bestScores.add((this.getEcmWeight() * -score) + (this.getWordGraphWeight() * this._wordGraph.getInitialStateScore()));
                bestPrevArcs.add(2147483647);
            }
        },
        updateStateBestScores: function (arcIndex, prefixDiffSize) {
            var arc = System.Array.getItem(this._wordGraph.getArcs(), arcIndex, SIL.Machine.Translation.WordGraphArc);
            var arcEsis = this._arcEcmScoreInfos.getItem(arcIndex);

            var prevEsi = arcEsis.getCount() === 0 ? this._stateEcmScoreInfos.getItem(arc.getPrevState()) : arcEsis.getItem(((arcEsis.getCount() - 1) | 0));

            var wordGraphScore = this._stateWordGraphScores.getItem(arc.getPrevState()) + arc.getScore();

            var nextStateBestScores = this._stateBestScores.getItem(arc.getNextState());
            var nextStateBestPrevArcs = this._stateBestPrevArcs.getItem(arc.getNextState());

            var positions = new (System.Collections.Generic.List$1(System.Int32))();
            var startPos = prefixDiffSize === 0 ? 0 : ((System.Array.getCount(prevEsi.getScores(), System.Double) - prefixDiffSize) | 0);
            for (var i = startPos; i < System.Array.getCount(prevEsi.getScores(), System.Double); i = (i + 1) | 0) {
                var newScore = (this.getEcmWeight() * -System.Array.getItem(prevEsi.getScores(), i, System.Double)) + (this.getWordGraphWeight() * wordGraphScore);

                if (i === nextStateBestScores.getCount() || nextStateBestScores.getItem(i) < newScore) {
                    this.addOrReplace(System.Double, nextStateBestScores, i, newScore);
                    positions.add(i);
                    this.addOrReplace(System.Int32, nextStateBestPrevArcs, i, arcIndex);
                }
            }

            this._stateEcmScoreInfos.getItem(arc.getNextState()).updatePositions(prevEsi, positions);

            this._stateWordGraphScores.setItem(arc.getNextState(), wordGraphScore);
        },
        addOrReplace: function (T, list, index, item) {
            if (index > list.getCount()) {
                throw new System.ArgumentOutOfRangeException("index");
            }

            if (index === list.getCount()) {
                list.add(item);
            } else {
                list.setItem(index, item);
            }
        },
        correct: function (prefix, isLastWordComplete, n) {
            var $t, $t1, $t2;
            // get valid portion of the processed prefix vector
            var validProcPrefixCount = 0;
            for (var i = 0; i < this._prevPrefix.length; i = (i + 1) | 0) {
                if (i >= System.Array.getCount(prefix, String)) {
                    break;
                }

                if (i === ((this._prevPrefix.length - 1) | 0) && i === ((System.Array.getCount(prefix, String) - 1) | 0)) {
                    if (Bridge.referenceEquals(this._prevPrefix[i], System.Array.getItem(prefix, i, String)) && this._prevIsLastWordComplete === isLastWordComplete) {
                        validProcPrefixCount = (validProcPrefixCount + 1) | 0;
                    }
                } else if (Bridge.referenceEquals(this._prevPrefix[i], System.Array.getItem(prefix, i, String))) {
                    validProcPrefixCount = (validProcPrefixCount + 1) | 0;
                }
            }

            var diffSize = (this._prevPrefix.length - validProcPrefixCount) | 0;
            if (diffSize > 0) {
                // adjust size of info for arcs
                $t = Bridge.getEnumerator(this._arcEcmScoreInfos);
                while ($t.moveNext()) {
                    var esis = $t.getCurrent();
                    $t1 = Bridge.getEnumerator(esis);
                    while ($t1.moveNext()) {
                        var esi = $t1.getCurrent();
                        for (var i1 = 0; i1 < diffSize; i1 = (i1 + 1) | 0) {
                            esi.removeLast();
                        }
                    }
                }

                // adjust size of info for states
                $t2 = Bridge.getEnumerator(this._statesInvolvedInArcs);
                while ($t2.moveNext()) {
                    var state = $t2.getCurrent();
                    for (var i2 = 0; i2 < diffSize; i2 = (i2 + 1) | 0) {
                        this._stateEcmScoreInfos.getItem(state).removeLast();
                        this._stateBestScores.getItem(state).removeAt(((this._stateBestScores.getItem(state).getCount() - 1) | 0));
                        this._stateBestPrevArcs.getItem(state).removeAt(((this._stateBestPrevArcs.getItem(state).getCount() - 1) | 0));
                    }
                }
            }

            // get difference between prefix and valid portion of processed prefix
            var prefixDiff = System.Array.init(((System.Array.getCount(prefix, String) - validProcPrefixCount) | 0), null, String);
            for (var i3 = 0; i3 < prefixDiff.length; i3 = (i3 + 1) | 0) {
                prefixDiff[i3] = System.Array.getItem(prefix, ((validProcPrefixCount + i3) | 0), String);
            }

            // process word-graph given prefix difference
            this.processWordGraphForPrefixDiff(prefixDiff, isLastWordComplete);

            var candidates = new (System.Collections.Generic.List$1(SIL.Machine.Translation.ErrorCorrectionWordGraphProcessor.Candidate))();
            this.getNBestStateCandidates(candidates, n);
            this.getNBestSubStateCandidates(candidates, n);

            var nbestCorrections = System.Linq.Enumerable.from(candidates).select(Bridge.fn.bind(this, function (c) {
                    return this.getCorrectionForCandidate(prefix, isLastWordComplete, c);
                })).toArray();

            this._prevPrefix = System.Linq.Enumerable.from(prefix).toArray();
            this._prevIsLastWordComplete = isLastWordComplete;

            return nbestCorrections;
        },
        processWordGraphForPrefixDiff: function (prefixDiff, isLastWordComplete) {
            if (System.Array.getCount(prefixDiff, String) === 0) {
                return;
            }

            if (!this._wordGraph.getIsEmpty()) {
                var prevInitialEsi = this._stateEcmScoreInfos.getItem(SIL.Machine.Translation.WordGraph.InitialState);
                this._ecm.extendInitialEsi(this._stateEcmScoreInfos.getItem(SIL.Machine.Translation.WordGraph.InitialState), prevInitialEsi, prefixDiff);
                this.updateInitialStateBestScores();
            }

            for (var arcIndex = 0; arcIndex < System.Array.getCount(this._wordGraph.getArcs(), SIL.Machine.Translation.WordGraphArc); arcIndex = (arcIndex + 1) | 0) {
                var arc = System.Array.getItem(this._wordGraph.getArcs(), arcIndex, SIL.Machine.Translation.WordGraphArc);

                // update ecm score info for each word of arc
                var prevEsi = this._stateEcmScoreInfos.getItem(arc.getPrevState());
                var esis = this._arcEcmScoreInfos.getItem(arcIndex);
                while (esis.getCount() < System.Array.getCount(arc.getWords(), String)) {
                    esis.add(new SIL.Machine.Translation.EcmScoreInfo());
                }
                for (var i = 0; i < System.Array.getCount(arc.getWords(), String); i = (i + 1) | 0) {
                    var esi = esis.getItem(i);
                    this._ecm.extendEsi(esi, prevEsi, arc.getIsUnknown() ? "" : System.Array.getItem(arc.getWords(), i, String), prefixDiff, isLastWordComplete);
                    prevEsi = esi;
                }

                // update best scores for the arc's successive state
                this.updateStateBestScores(arcIndex, System.Array.getCount(prefixDiff, String));
            }
        },
        getNBestStateCandidates: function (candidates, n) {
            var $t;
            $t = Bridge.getEnumerator(this._statesInvolvedInArcs);
            while ($t.moveNext()) {
                var state = $t.getCurrent();
                var restScore = this._restScores[state];
                var bestScores = this._stateBestScores.getItem(state);

                var score = bestScores.getItem(((bestScores.getCount() - 1) | 0)) + (this.getWordGraphWeight() * restScore);
                SIL.Machine.Translation.ErrorCorrectionWordGraphProcessor.addToNBestList(SIL.Machine.Translation.ErrorCorrectionWordGraphProcessor.Candidate, candidates, n, new SIL.Machine.Translation.ErrorCorrectionWordGraphProcessor.Candidate(score, state));
            }
        },
        getNBestSubStateCandidates: function (candidates, n) {
            for (var arcIndex = 0; arcIndex < System.Array.getCount(this._wordGraph.getArcs(), SIL.Machine.Translation.WordGraphArc); arcIndex = (arcIndex + 1) | 0) {
                var arc = System.Array.getItem(this._wordGraph.getArcs(), arcIndex, SIL.Machine.Translation.WordGraphArc);
                if (System.Array.getCount(arc.getWords(), String) > 1) {
                    var wordGraphScore = this._stateWordGraphScores.getItem(arc.getPrevState());

                    for (var i = 0; i < ((System.Array.getCount(arc.getWords(), String) - 1) | 0); i = (i + 1) | 0) {
                        var esi = this._arcEcmScoreInfos.getItem(arcIndex).getItem(i);
                        var score = (this.getWordGraphWeight() * wordGraphScore) + (this.getEcmWeight() * -System.Array.getItem(esi.getScores(), ((System.Array.getCount(esi.getScores(), System.Double) - 1) | 0), System.Double)) + (this.getWordGraphWeight() * this._restScores[arc.getPrevState()]);
                        SIL.Machine.Translation.ErrorCorrectionWordGraphProcessor.addToNBestList(SIL.Machine.Translation.ErrorCorrectionWordGraphProcessor.Candidate, candidates, n, new SIL.Machine.Translation.ErrorCorrectionWordGraphProcessor.Candidate(score, arc.getNextState(), arcIndex, i));
                    }
                }
            }
        },
        getCorrectionForCandidate: function (prefix, isLastWordComplete, candidate) {
            var $t;
            var correction = Bridge.merge(new SIL.Machine.Translation.TranslationInfo(), {
                setScore: candidate.getScore()
            } );

            var uncorrectedPrefixLen;
            if (candidate.getArcIndex() === -1) {
                this.addBestUncorrectedPrefixState(correction, System.Array.getCount(prefix, String), candidate.getState());
                uncorrectedPrefixLen = System.Array.getCount(correction.getTarget(), String);
            } else {
                this.addBestUncorrectedPrefixSubState(correction, System.Array.getCount(prefix, String), candidate.getArcIndex(), candidate.getArcWordIndex());
                var firstArc = System.Array.getItem(this._wordGraph.getArcs(), candidate.getArcIndex(), SIL.Machine.Translation.WordGraphArc);
                uncorrectedPrefixLen = (((((System.Array.getCount(correction.getTarget(), String) - System.Array.getCount(firstArc.getWords(), String)) | 0) - candidate.getArcWordIndex()) | 0) + 1) | 0;
            }

            var alignmentColsToAddCount = this._ecm.correctPrefix(correction, uncorrectedPrefixLen, prefix, isLastWordComplete);

            $t = Bridge.getEnumerator(System.Linq.Enumerable.from(this._wordGraph.getBestPathFromFinalStateToState(candidate.getState())).reverse());
            while ($t.moveNext()) {
                var arc = $t.getCurrent();
                this.updateCorrectionFromArc(correction, arc, false, alignmentColsToAddCount);
            }

            return correction;
        },
        addBestUncorrectedPrefixState: function (correction, procPrefixPos, state) {
            var $t;
            var arcs = new (System.Collections.Generic.Stack$1(SIL.Machine.Translation.WordGraphArc)).ctor();

            var curState = state;
            var curProcPrefixPos = procPrefixPos;
            while (curState !== 0) {
                var arcIndex = this._stateBestPrevArcs.getItem(curState).getItem(curProcPrefixPos);
                var arc = System.Array.getItem(this._wordGraph.getArcs(), arcIndex, SIL.Machine.Translation.WordGraphArc);

                for (var i = (System.Array.getCount(arc.getWords(), String) - 1) | 0; i >= 0; i = (i - 1) | 0) {
                    var predPrefixWords = this._arcEcmScoreInfos.getItem(arcIndex).getItem(i).getLastInsPrefixWordFromEsi();
                    curProcPrefixPos = System.Array.getItem(predPrefixWords, curProcPrefixPos, System.Int32);
                }

                arcs.push(arc);

                curState = arc.getPrevState();
            }

            $t = Bridge.getEnumerator(arcs);
            while ($t.moveNext()) {
                var arc1 = $t.getCurrent();
                this.updateCorrectionFromArc(correction, arc1, true, 0);
            }
        },
        addBestUncorrectedPrefixSubState: function (correction, procPrefixPos, arcIndex, arcWordIndex) {
            var arc = System.Array.getItem(this._wordGraph.getArcs(), arcIndex, SIL.Machine.Translation.WordGraphArc);

            var curProcPrefixPos = procPrefixPos;
            for (var i = arcWordIndex; i >= 0; i = (i - 1) | 0) {
                var predPrefixWords = this._arcEcmScoreInfos.getItem(arcIndex).getItem(i).getLastInsPrefixWordFromEsi();
                curProcPrefixPos = System.Array.getItem(predPrefixWords, curProcPrefixPos, System.Int32);
            }

            this.addBestUncorrectedPrefixState(correction, curProcPrefixPos, arc.getPrevState());

            this.updateCorrectionFromArc(correction, arc, true, 0);
        },
        updateCorrectionFromArc: function (correction, arc, isPrefix, alignmentColsToAddCount) {
            for (var i = 0; i < System.Array.getCount(arc.getWords(), String); i = (i + 1) | 0) {
                System.Array.add(correction.getTarget(), System.Array.getItem(arc.getWords(), i, String), String);
                System.Array.add(correction.getTargetConfidences(), System.Array.getItem(arc.getWordConfidences(), i, System.Double), System.Double);
                if (!isPrefix && arc.getIsUnknown()) {
                    correction.getTargetUnknownWords().System$Collections$Generic$ISet$1$System$Int32$add(((System.Array.getCount(correction.getTarget(), String) - 1) | 0));
                }
            }

            var alignment = arc.getAlignment();
            if (alignmentColsToAddCount > 0) {
                var newAlignment = new SIL.Machine.Translation.WordAlignmentMatrix.$ctor1(alignment.getRowCount(), ((alignment.getColumnCount() + alignmentColsToAddCount) | 0));
                for (var j = 0; j < alignment.getColumnCount(); j = (j + 1) | 0) {
                    for (var i1 = 0; i1 < alignment.getRowCount(); i1 = (i1 + 1) | 0) {
                        newAlignment.setItem(i1, ((alignmentColsToAddCount + j) | 0), alignment.getItem(i1, j));
                    }
                }
                alignment = newAlignment;
            }

            var phrase = Bridge.merge(new SIL.Machine.Translation.PhraseInfo(), {
                setSourceStartIndex: arc.getSourceStartIndex(),
                setSourceEndIndex: arc.getSourceEndIndex(),
                setTargetCut: ((System.Array.getCount(correction.getTarget(), String) - 1) | 0),
                setAlignment: alignment
            } );
            System.Array.add(correction.getPhrases(), phrase, SIL.Machine.Translation.PhraseInfo);
        }
    });

    Bridge.define("SIL.Machine.Translation.ErrorCorrectionWordGraphProcessor.Candidate", {
        inherits: function () { return [System.IComparable$1(SIL.Machine.Translation.ErrorCorrectionWordGraphProcessor.Candidate)]; },
        config: {
            properties: {
                Score: 0,
                State: 0,
                ArcIndex: 0,
                ArcWordIndex: 0
            },
            alias: [
            "compareTo", "System$IComparable$1$SIL$Machine$Translation$ErrorCorrectionWordGraphProcessor$Candidate$compareTo"
            ]
        },
        ctor: function (score, state, arcIndex, arcWordIndex) {
            if (arcIndex === void 0) { arcIndex = -1; }
            if (arcWordIndex === void 0) { arcWordIndex = -1; }

            this.$initialize();
            this.setScore(score);
            this.setState(state);
            this.setArcIndex(arcIndex);
            this.setArcWordIndex(arcWordIndex);
        },
        compareTo: function (other) {
            return ((-Bridge.compare(this.getScore(), other.getScore())) | 0);
        }
    });

    Bridge.define("SIL.Machine.Translation.InteractiveTranslationSession", {
        statics: {
            RuleEngineThreshold: 0.05
        },
        _engine: null,
        _wordGraphProcessor: null,
        _curResult: null,
        _confidenceThreshold: 0,
        config: {
            properties: {
                SmtWordGraph: null,
                RuleResult: null,
                SourceSegment: null,
                Prefix: null,
                IsLastWordComplete: false,
                CurrentSuggestion: null
            }
        },
        ctor: function (engine, sourceSegment, confidenceThreshold, smtWordGraph, ruleResult) {
            this.$initialize();
            this._engine = engine;
            this.setSourceSegment(sourceSegment);
            this._confidenceThreshold = confidenceThreshold;
            this.setRuleResult(ruleResult);
            this.setSmtWordGraph(smtWordGraph);

            this._wordGraphProcessor = new SIL.Machine.Translation.ErrorCorrectionWordGraphProcessor(this._engine.getErrorCorrectionModel(), this.getSmtWordGraph());
            this.updatePrefix("");
        },
        getConfidenceThreshold: function () {
            return this._confidenceThreshold;
        },
        setConfidenceThreshold: function (value) {
            if (this._confidenceThreshold !== value) {
                this._confidenceThreshold = value;
                this.updateSuggestion();
            }
        },
        updatePrefix: function (prefix) {
            var tokenSpans = System.Linq.Enumerable.from(this._engine.getTargetTokenizer().SIL$Machine$Tokenization$ITokenizer$2$String$System$Int32$tokenize(prefix)).toArray();
            this.setPrefix(System.Linq.Enumerable.from(tokenSpans).select(function (s) {
                    return prefix.substr(s.getStart(), s.getLength());
                }).toArray());
            this.setIsLastWordComplete(tokenSpans.length === 0 || tokenSpans[((tokenSpans.length - 1) | 0)].getEnd() !== prefix.length);

            var correction = System.Linq.Enumerable.from(this._wordGraphProcessor.correct(this.getPrefix(), this.getIsLastWordComplete(), 1)).firstOrDefault(null, null);
            var smtResult = this.createResult(correction);

            if (this.getRuleResult() == null) {
                this._curResult = smtResult;
            } else {
                var prefixCount = this.getPrefix().length;
                if (!this.getIsLastWordComplete()) {
                    prefixCount = (prefixCount - 1) | 0;
                }

                this._curResult = smtResult.merge(prefixCount, SIL.Machine.Translation.InteractiveTranslationSession.RuleEngineThreshold, this.getRuleResult());
            }

            this.updateSuggestion();

            return this.getCurrentSuggestion();
        },
        updateSuggestion: function () {
            var suggestions = System.Linq.Enumerable.from(SIL.Machine.Translation.TranslationSuggester.getSuggestedWordIndices(this.getPrefix(), this.getIsLastWordComplete(), this._curResult, this._confidenceThreshold)).select(Bridge.fn.bind(this, $asm.$.SIL.Machine.Translation.InteractiveTranslationSession.f1)).toArray();

            this.setCurrentSuggestion(suggestions);
        },
        approve: function (onFinished) {
            var url = System.String.format("{0}/translation/engines/{1}/{2}/projects/{3}/actions/train-segment", this._engine.getBaseUrl(), this._engine.getSourceLanguageTag(), this._engine.getTargetLanguageTag(), this._engine.getProjectId());
            var body = JSON.stringify(new $asm.$AnonymousType$1(this.getSourceSegment(), this.getPrefix()));
            this._engine.getWebClient().SIL$Machine$Web$IWebClient$send("POST", url, body, "application/json", function (responseText) {
                onFinished(true);
            }, function (status) {
                onFinished(false);
            });
        },
        createResult: function (info) {
            var $t;
            if (info == null) {
                return new SIL.Machine.Translation.TranslationResult(this.getSourceSegment(), System.Linq.Enumerable.empty(), System.Linq.Enumerable.empty(), System.Linq.Enumerable.empty(), new SIL.Machine.Translation.WordAlignmentMatrix.$ctor1(this.getSourceSegment().length, 0));
            }

            var confidences = System.Linq.Enumerable.from(info.getTargetConfidences()).toArray();
            var sources = System.Array.init(System.Array.getCount(info.getTarget(), String), 0, SIL.Machine.Translation.TranslationSources);
            var alignment = new SIL.Machine.Translation.WordAlignmentMatrix.$ctor1(this.getSourceSegment().length, System.Array.getCount(info.getTarget(), String));
            var trgPhraseStartIndex = 0;
            $t = Bridge.getEnumerator(info.getPhrases(), SIL.Machine.Translation.PhraseInfo);
            while ($t.moveNext()) {
                var phrase = $t.getCurrent();
                for (var j = trgPhraseStartIndex; j <= phrase.getTargetCut(); j = (j + 1) | 0) {
                    for (var i = phrase.getSourceStartIndex(); i <= phrase.getSourceEndIndex(); i = (i + 1) | 0) {
                        if (phrase.getAlignment().getItem(((i - phrase.getSourceStartIndex()) | 0), ((j - trgPhraseStartIndex) | 0)) === SIL.Machine.Translation.AlignmentType.Aligned) {
                            alignment.setItem(i, j, SIL.Machine.Translation.AlignmentType.Aligned);
                        }
                    }
                    sources[j] = System.Array.contains(info.getTargetUnknownWords(), j, System.Int32) ? SIL.Machine.Translation.TranslationSources.None : SIL.Machine.Translation.TranslationSources.Smt;
                }
                trgPhraseStartIndex = (phrase.getTargetCut() + 1) | 0;
            }

            return new SIL.Machine.Translation.TranslationResult(this.getSourceSegment(), info.getTarget(), confidences, sources, alignment);
        }
    });

    Bridge.define("$AnonymousType$1", $asm, {
        $kind: "anonymous",
        ctor: function (sourceSegment, targetSegment) {
            this.sourceSegment = sourceSegment;
            this.targetSegment = targetSegment;
        },
        getsourceSegment : function () {
            return this.sourceSegment;
        },
        gettargetSegment : function () {
            return this.targetSegment;
        },
        equals: function (o) {
            if (!Bridge.is(o, $asm.$AnonymousType$1)) {
                return false;
            }
            return Bridge.equals(this.sourceSegment, o.sourceSegment) && Bridge.equals(this.targetSegment, o.targetSegment);
        },
        getHashCode: function () {
            var h = Bridge.addHash([7550196186, this.sourceSegment, this.targetSegment]);
            return h;
        },
        toJSON: function () {
            return {
                sourceSegment : this.sourceSegment,
                targetSegment : this.targetSegment
            };
        }
    });

    Bridge.ns("SIL.Machine.Translation.InteractiveTranslationSession", $asm.$);

    Bridge.apply($asm.$.SIL.Machine.Translation.InteractiveTranslationSession, {
        f1: function (j) {
            return System.Array.getItem(this._curResult.getTargetSegment(), j, String);
        }
    });

    Bridge.define("SIL.Machine.Translation.PhraseInfo", {
        config: {
            properties: {
                SourceStartIndex: 0,
                SourceEndIndex: 0,
                TargetCut: 0,
                Alignment: null
            }
        }
    });

    Bridge.define("SIL.Machine.Translation.TranslationEngine", {
        config: {
            properties: {
                SourceLanguageTag: null,
                TargetLanguageTag: null,
                ProjectId: null,
                BaseUrl: null,
                WebClient: null,
                SourceTokenizer: null,
                TargetTokenizer: null,
                ErrorCorrectionModel: null
            }
        },
        ctor: function (baseUrl, sourceLanguageTag, targetLanguageTag, projectId) {
            SIL.Machine.Translation.TranslationEngine.$ctor1.call(this, baseUrl, sourceLanguageTag, targetLanguageTag, projectId, new SIL.Machine.Tokenization.LatinWordTokenizer.ctor());
        },
        $ctor1: function (baseUrl, sourceLanguageTag, targetLanguageTag, projectId, tokenizer) {
            SIL.Machine.Translation.TranslationEngine.$ctor2.call(this, baseUrl, sourceLanguageTag, targetLanguageTag, projectId, tokenizer, tokenizer);
        },
        $ctor2: function (baseUrl, sourceLanguageTag, targetLanguageTag, projectId, sourceTokenizer, targetTokenizer) {
            SIL.Machine.Translation.TranslationEngine.$ctor3.call(this, baseUrl, sourceLanguageTag, targetLanguageTag, projectId, sourceTokenizer, targetTokenizer, new SIL.Machine.Web.AjaxWebClient());
        },
        $ctor3: function (baseUrl, sourceLanguageTag, targetLanguageTag, projectId, sourceTokenizer, targetTokenizer, webClient) {
            this.$initialize();
            this.setBaseUrl(baseUrl);
            this.setSourceLanguageTag(sourceLanguageTag);
            this.setTargetLanguageTag(targetLanguageTag);
            this.setProjectId(projectId);
            this.setSourceTokenizer(sourceTokenizer);
            this.setTargetTokenizer(targetTokenizer);
            this.setWebClient(webClient);
            this.setErrorCorrectionModel(new SIL.Machine.Translation.ErrorCorrectionModel());
        },
        translateInteractively: function (sourceSegment, confidenceThreshold, onFinished) {
            var tokens = System.Linq.Enumerable.from(SIL.Machine.Tokenization.TokenizationExtensions.tokenizeToStrings(this.getSourceTokenizer(), sourceSegment)).toArray();
            var url = System.String.format("{0}/translation/engines/{1}/{2}/projects/{3}/actions/interactive-translate", this.getBaseUrl(), this.getSourceLanguageTag(), this.getTargetLanguageTag(), this.getProjectId());
            var body = JSON.stringify(tokens);
            this.getWebClient().SIL$Machine$Web$IWebClient$send("POST", url, body, "application/json", Bridge.fn.bind(this, function (responseText) {
                onFinished(this.createSession(tokens, confidenceThreshold, JSON.parse(responseText)));
            }), function (status) {
                onFinished(null);
            });
        },
        createSession: function (sourceSegment, confidenceThreshold, json) {
            var wordGraph = this.createWordGraph(json.wordGraph);
            var ruleResult = this.createRuleResult(sourceSegment, json.ruleResult);
            return new SIL.Machine.Translation.InteractiveTranslationSession(this, sourceSegment, confidenceThreshold, wordGraph, ruleResult);
        },
        createWordGraph: function (jsonWordGraph) {
            var $t, $t1, $t2, $t3, $t4;
            var initialStateScore = jsonWordGraph.initialStateScore;

            var finalStates = new (System.Collections.Generic.List$1(System.Int32))();
            var jsonFinalStates = jsonWordGraph.finalStates;
            $t = Bridge.getEnumerator(jsonFinalStates);
            while ($t.moveNext()) {
                var jsonFinalState = $t.getCurrent();
                finalStates.add(jsonFinalState);
            }

            var jsonArcs = jsonWordGraph.arcs;
            var arcs = new (System.Collections.Generic.List$1(SIL.Machine.Translation.WordGraphArc))();
            $t1 = Bridge.getEnumerator(jsonArcs);
            while ($t1.moveNext()) {
                var jsonArc = $t1.getCurrent();
                var prevState = jsonArc.prevState;
                var nextState = jsonArc.nextState;
                var score = jsonArc.score;

                var jsonWords = jsonArc.words;
                var words = new (System.Collections.Generic.List$1(String))();
                $t2 = Bridge.getEnumerator(jsonWords);
                while ($t2.moveNext()) {
                    var jsonWord = $t2.getCurrent();
                    words.add(jsonWord);
                }

                var jsonConfidences = jsonArc.confidences;
                var confidences = new (System.Collections.Generic.List$1(System.Double))();
                $t3 = Bridge.getEnumerator(jsonConfidences);
                while ($t3.moveNext()) {
                    var jsonConfidence = $t3.getCurrent();
                    confidences.add(jsonConfidence);
                }

                var srcStartIndex = jsonArc.sourceStartIndex;
                var endStartIndex = jsonArc.sourceEndIndex;
                var isUnknown = jsonArc.isUnknown;

                var jsonAlignment = jsonArc.alignment;
                var alignment = new SIL.Machine.Translation.WordAlignmentMatrix.$ctor1(((((endStartIndex - srcStartIndex) | 0) + 1) | 0), words.getCount());
                $t4 = Bridge.getEnumerator(jsonAlignment);
                while ($t4.moveNext()) {
                    var jsonAligned = $t4.getCurrent();
                    var i = jsonAligned.sourceIndex;
                    var j = jsonAligned.targetIndex;
                    alignment.setItem(i, j, SIL.Machine.Translation.AlignmentType.Aligned);
                }

                arcs.add(new SIL.Machine.Translation.WordGraphArc(prevState, nextState, score, words.toArray(), alignment, confidences.toArray(), srcStartIndex, endStartIndex, isUnknown));
            }

            return new SIL.Machine.Translation.WordGraph(arcs, finalStates, initialStateScore);
        },
        createRuleResult: function (sourceSegment, jsonResult) {
            var $t, $t1, $t2, $t3;
            if (jsonResult == null) {
                return null;
            }

            var jsonTarget = jsonResult.target;
            var targetSegment = new (System.Collections.Generic.List$1(String))();
            $t = Bridge.getEnumerator(jsonTarget);
            while ($t.moveNext()) {
                var jsonWord = $t.getCurrent();
                targetSegment.add(jsonWord);
            }

            var jsonConfidences = jsonResult.confidences;
            var confidences = new (System.Collections.Generic.List$1(System.Double))();
            $t1 = Bridge.getEnumerator(jsonConfidences);
            while ($t1.moveNext()) {
                var jsonConfidence = $t1.getCurrent();
                confidences.add(jsonConfidence);
            }

            var jsonSources = jsonResult.sources;
            var sources = new (System.Collections.Generic.List$1(SIL.Machine.Translation.TranslationSources))();
            $t2 = Bridge.getEnumerator(jsonSources);
            while ($t2.moveNext()) {
                var jsonSource = $t2.getCurrent();
                sources.add(Bridge.cast(jsonSource, System.Int32));
            }

            var jsonAlignment = jsonResult.alignment;
            var alignment = new SIL.Machine.Translation.WordAlignmentMatrix.$ctor1(sourceSegment.length, targetSegment.getCount());
            $t3 = Bridge.getEnumerator(jsonAlignment);
            while ($t3.moveNext()) {
                var jsonAligned = $t3.getCurrent();
                var i = jsonAligned.sourceIndex;
                var j = jsonAligned.targetIndex;
                alignment.setItem(i, j, SIL.Machine.Translation.AlignmentType.Aligned);
            }

            return new SIL.Machine.Translation.TranslationResult(sourceSegment, targetSegment, confidences, sources, alignment);
        }
    });

    Bridge.define("SIL.Machine.Translation.TranslationInfo", {
        config: {
            properties: {
                Target: null,
                TargetConfidences: null,
                Phrases: null,
                TargetUnknownWords: null,
                TargetUncorrectedPrefixWords: null,
                Score: 0
            },
            init: function () {
                this.Target = new (System.Collections.Generic.List$1(String))();
                this.TargetConfidences = new (System.Collections.Generic.List$1(System.Double))();
                this.Phrases = new (System.Collections.Generic.List$1(SIL.Machine.Translation.PhraseInfo))();
                this.TargetUnknownWords = new (System.Collections.Generic.HashSet$1(System.Int32)).ctor();
                this.TargetUncorrectedPrefixWords = new (System.Collections.Generic.HashSet$1(System.Int32)).ctor();
            }
        }
    });

    Bridge.define("SIL.Machine.Translation.TranslationResult", {
        config: {
            properties: {
                SourceSegment: null,
                TargetSegment: null,
                TargetWordConfidences: null,
                TargetWordSources: null,
                Alignment: null
            }
        },
        ctor: function (sourceSegment, targetSegment, confidences, sources, alignment) {
            this.$initialize();
            this.setSourceSegment(System.Linq.Enumerable.from(sourceSegment).toArray());
            this.setTargetSegment(System.Linq.Enumerable.from(targetSegment).toArray());
            this.setTargetWordConfidences(System.Linq.Enumerable.from(confidences).toArray());
            if (System.Array.getCount(this.getTargetWordConfidences(), System.Double) !== System.Array.getCount(this.getTargetSegment(), String)) {
                throw new System.ArgumentException("The confidences must be the same length as the target segment.", "confidences");
            }
            this.setTargetWordSources(System.Linq.Enumerable.from(sources).toArray());
            if (System.Array.getCount(this.getTargetWordSources(), SIL.Machine.Translation.TranslationSources) !== System.Array.getCount(this.getTargetSegment(), String)) {
                throw new System.ArgumentException("The sources must be the same length as the target segment.", "sources");
            }
            this.setAlignment(alignment);
            if (this.getAlignment().getRowCount() !== System.Array.getCount(this.getSourceSegment(), String)) {
                throw new System.ArgumentException("The alignment source length must be the same length as the source segment.", "alignment");
            }
            if (this.getAlignment().getColumnCount() !== System.Array.getCount(this.getTargetSegment(), String)) {
                throw new System.ArgumentException("The alignment target length must be the same length as the target segment.", "alignment");
            }
        },
        merge: function (prefixCount, threshold, otherResult) {
            var $t, $t1, $t2, $t3, $t4, $t5;
            var mergedTargetSegment = new (System.Collections.Generic.List$1(String))();
            var mergedConfidences = new (System.Collections.Generic.List$1(System.Double))();
            var mergedSources = new (System.Collections.Generic.List$1(SIL.Machine.Translation.TranslationSources))();
            var mergedAlignment = new (System.Collections.Generic.HashSet$1(Object)).ctor();
            for (var j = 0; j < System.Array.getCount(this.getTargetSegment(), String); j = (j + 1) | 0) {
                var sourceIndices = System.Linq.Enumerable.from(this.getAlignment().getColumnAlignedIndices(j)).toArray();
                if (sourceIndices.length === 0) {
                    // target word doesn't align with anything
                    mergedTargetSegment.add(System.Array.getItem(this.getTargetSegment(), j, String));
                    mergedConfidences.add(System.Array.getItem(this.getTargetWordConfidences(), j, System.Double));
                    mergedSources.add(System.Array.getItem(this.getTargetWordSources(), j, SIL.Machine.Translation.TranslationSources));
                } else {
                    // target word aligns with some source words
                    if (j < prefixCount || System.Array.getItem(this.getTargetWordConfidences(), j, System.Double) >= threshold) {
                        // use target word of this result
                        mergedTargetSegment.add(System.Array.getItem(this.getTargetSegment(), j, String));
                        mergedConfidences.add(System.Array.getItem(this.getTargetWordConfidences(), j, System.Double));
                        var sources = System.Array.getItem(this.getTargetWordSources(), j, SIL.Machine.Translation.TranslationSources);
                        $t = Bridge.getEnumerator(sourceIndices);
                        while ($t.moveNext()) {
                            var i = $t.getCurrent();
                            // combine sources for any words that both this result and the other result translated the same
                            $t1 = Bridge.getEnumerator(otherResult.getAlignment().getRowAlignedIndices(i), System.Int32);
                            while ($t1.moveNext()) {
                                var jOther = $t1.getCurrent();
                                var otherSources = System.Array.getItem(otherResult.getTargetWordSources(), jOther, SIL.Machine.Translation.TranslationSources);
                                if (otherSources !== SIL.Machine.Translation.TranslationSources.None && Bridge.referenceEquals(System.Array.getItem(otherResult.getTargetSegment(), jOther, String), System.Array.getItem(this.getTargetSegment(), j, String))) {
                                    sources |= otherSources;
                                }
                            }

                            mergedAlignment.add({ item1: i, item2: ((mergedTargetSegment.getCount() - 1) | 0) });
                        }
                        mergedSources.add(sources);
                    } else {
                        // use target words of other result
                        var found = false;
                        $t2 = Bridge.getEnumerator(sourceIndices);
                        while ($t2.moveNext()) {
                            var i1 = $t2.getCurrent();
                            $t3 = Bridge.getEnumerator(otherResult.getAlignment().getRowAlignedIndices(i1), System.Int32);
                            while ($t3.moveNext()) {
                                var jOther1 = $t3.getCurrent();
                                // look for any translated words from other result
                                var otherSources1 = System.Array.getItem(otherResult.getTargetWordSources(), jOther1, SIL.Machine.Translation.TranslationSources);
                                if (otherSources1 !== SIL.Machine.Translation.TranslationSources.None) {
                                    mergedTargetSegment.add(System.Array.getItem(otherResult.getTargetSegment(), jOther1, String));
                                    mergedConfidences.add(System.Array.getItem(otherResult.getTargetWordConfidences(), jOther1, System.Double));
                                    mergedSources.add(otherSources1);
                                    mergedAlignment.add({ item1: i1, item2: ((mergedTargetSegment.getCount() - 1) | 0) });
                                    found = true;
                                }
                            }
                        }

                        if (!found) {
                            // the other result had no translated words, so just use this result's target word
                            mergedTargetSegment.add(System.Array.getItem(this.getTargetSegment(), j, String));
                            mergedConfidences.add(System.Array.getItem(this.getTargetWordConfidences(), j, System.Double));
                            mergedSources.add(System.Array.getItem(this.getTargetWordSources(), j, SIL.Machine.Translation.TranslationSources));
                            $t4 = Bridge.getEnumerator(sourceIndices);
                            while ($t4.moveNext()) {
                                var i2 = $t4.getCurrent();
                                mergedAlignment.add({ item1: i2, item2: ((mergedTargetSegment.getCount() - 1) | 0) });
                            }
                        }
                    }
                }
            }

            var alignment = new SIL.Machine.Translation.WordAlignmentMatrix.$ctor1(System.Array.getCount(this.getSourceSegment(), String), mergedTargetSegment.getCount());
            $t5 = Bridge.getEnumerator(mergedAlignment);
            while ($t5.moveNext()) {
                var t = $t5.getCurrent();
                alignment.setItem(t.item1, t.item2, SIL.Machine.Translation.AlignmentType.Aligned);
            }
            return new SIL.Machine.Translation.TranslationResult(this.getSourceSegment(), mergedTargetSegment, mergedConfidences, mergedSources, alignment);
        }
    });

    Bridge.define("SIL.Machine.Translation.TranslationSources", {
        $kind: "enum",
        statics: {
            None: 0,
            Smt: 1,
            Transfer: 2,
            Prefix: 4
        },
        $flags: true
    });

    Bridge.define("SIL.Machine.Translation.TranslationSuggester", {
        statics: {
            getSuggestedWordIndices: function (prefix, isLastWordComplete, result, confidenceThreshold) {
                var $t;
                var $yield = [];
                var startingJ = System.Array.getCount(prefix, String);
                if (!isLastWordComplete) {
                    // if the prefix ends with a partial word and it has been completed,
                    // then make sure it is included as a suggestion,
                    // otherwise, don't return any suggestions
                    if ((System.Array.getItem(result.getTargetWordSources(), ((startingJ - 1) | 0), SIL.Machine.Translation.TranslationSources) & SIL.Machine.Translation.TranslationSources.Smt) !== 0) {
                        startingJ = (startingJ - 1) | 0;
                    } else {
                        return System.Array.toEnumerable($yield);
                    }
                }

                var lookaheadCount = 1;
                var i = -1, j;
                for (j = System.Array.getCount(prefix, String); j < System.Array.getCount(result.getTargetSegment(), String); j = (j + 1) | 0) {
                    var sourceIndices = System.Linq.Enumerable.from(result.getAlignment().getColumnAlignedIndices(j)).toArray();
                    if (sourceIndices.length === 0) {
                        lookaheadCount = (lookaheadCount + 1) | 0;
                    } else {
                        lookaheadCount = (lookaheadCount + (((sourceIndices.length - 1) | 0))) | 0;
                        $t = Bridge.getEnumerator(sourceIndices);
                        while ($t.moveNext()) {
                            var ti = $t.getCurrent();
                            if (i === -1 || ti < i) {
                                i = ti;
                            }
                        }
                    }
                }
                if (i === -1) {
                    i = 0;
                }
                for (; i < System.Array.getCount(result.getSourceSegment(), String); i = (i + 1) | 0) {
                    if (result.getAlignment().isRowAligned(i) === SIL.Machine.Translation.AlignmentType.NotAligned) {
                        lookaheadCount = (lookaheadCount + 1) | 0;
                    }
                }

                j = startingJ;
                var inPhrase = false;
                while (j < System.Array.getCount(result.getTargetSegment(), String) && (lookaheadCount > 0 || inPhrase)) {
                    var word = System.Array.getItem(result.getTargetSegment(), j, String);
                    // stop suggesting at punctuation
                    if (System.Linq.Enumerable.from(word).all(function (ch) { return System.Char.isPunctuation(ch); })) {
                        break;
                    }

                    // criteria for suggesting a word
                    // the word must either:
                    // - meet the confidence threshold
                    // - come from a transfer engine
                    var confidence = System.Array.getItem(result.getTargetWordConfidences(), j, System.Double);
                    var sources = System.Array.getItem(result.getTargetWordSources(), j, SIL.Machine.Translation.TranslationSources);
                    if (confidence >= confidenceThreshold || (sources & SIL.Machine.Translation.TranslationSources.Transfer) !== 0) {
                        $yield.push(j);
                        inPhrase = true;
                        lookaheadCount = (lookaheadCount - 1) | 0;
                    } else {
                        // skip over inserted words
                        if (result.getAlignment().isColumnAligned(j) === SIL.Machine.Translation.AlignmentType.Aligned) {
                            lookaheadCount = (lookaheadCount - 1) | 0;
                            // only suggest the first word/phrase we find
                            if (inPhrase) {
                                break;
                            }
                        }
                    }
                    j = (j + 1) | 0;
                }
                return System.Array.toEnumerable($yield);
            }
        }
    });

    Bridge.define("SIL.Machine.Translation.WordAlignmentMatrix", {
        _matrix: null,
        $ctor1: function (i, j, defaultValue) {
            if (defaultValue === void 0) { defaultValue = 0; }

            this.$initialize();
            this._matrix = System.Array.create(0, null, SIL.Machine.Translation.AlignmentType, i, j);
            if (defaultValue !== SIL.Machine.Translation.AlignmentType.NotAligned) {
                this.setAll(defaultValue);
            }
        },
        ctor: function (other) {
            this.$initialize();
            this._matrix = System.Array.create(0, null, SIL.Machine.Translation.AlignmentType, other.getRowCount(), other.getColumnCount());
            for (var i = 0; i < this.getRowCount(); i = (i + 1) | 0) {
                for (var j = 0; j < this.getColumnCount(); j = (j + 1) | 0) {
                    this._matrix.set([i, j], other._matrix.get([i, j]));
                }
            }
        },
        getRowCount: function () {
            return System.Array.getLength(this._matrix, 0);
        },
        getColumnCount: function () {
            return System.Array.getLength(this._matrix, 1);
        },
        getItem: function (i, j) {
            return this._matrix.get([i, j]);
        },
        setItem: function (i, j, value) {
            this._matrix.set([i, j], value);
        },
        setAll: function (value) {
            for (var i = 0; i < this.getRowCount(); i = (i + 1) | 0) {
                for (var j = 0; j < this.getColumnCount(); j = (j + 1) | 0) {
                    this._matrix.set([i, j], value);
                }
            }
        },
        isRowAligned: function (i) {
            for (var j = 0; j < this.getColumnCount(); j = (j + 1) | 0) {
                if (this._matrix.get([i, j]) === SIL.Machine.Translation.AlignmentType.Aligned) {
                    return SIL.Machine.Translation.AlignmentType.Aligned;
                }
                if (this._matrix.get([i, j]) === SIL.Machine.Translation.AlignmentType.Unknown) {
                    return SIL.Machine.Translation.AlignmentType.Unknown;
                }
            }
            return SIL.Machine.Translation.AlignmentType.NotAligned;
        },
        isColumnAligned: function (j) {
            for (var i = 0; i < this.getRowCount(); i = (i + 1) | 0) {
                if (this._matrix.get([i, j]) === SIL.Machine.Translation.AlignmentType.Aligned) {
                    return SIL.Machine.Translation.AlignmentType.Aligned;
                }
                if (this._matrix.get([i, j]) === SIL.Machine.Translation.AlignmentType.Unknown) {
                    return SIL.Machine.Translation.AlignmentType.Unknown;
                }
            }
            return SIL.Machine.Translation.AlignmentType.NotAligned;
        },
        getRowAlignedIndices: function (i) {
            var $yield = [];
            for (var j = 0; j < this.getColumnCount(); j = (j + 1) | 0) {
                if (this._matrix.get([i, j]) === SIL.Machine.Translation.AlignmentType.Aligned) {
                    $yield.push(j);
                }
            }
            return System.Array.toEnumerable($yield);
        },
        getColumnAlignedIndices: function (j) {
            var $yield = [];
            for (var i = 0; i < this.getRowCount(); i = (i + 1) | 0) {
                if (this._matrix.get([i, j]) === SIL.Machine.Translation.AlignmentType.Aligned) {
                    $yield.push(i);
                }
            }
            return System.Array.toEnumerable($yield);
        },
        isNeighborAligned: function (i, j) {
            if (i > 0 && this._matrix.get([((i - 1) | 0), j]) === SIL.Machine.Translation.AlignmentType.Aligned) {
                return true;
            }
            if (j > 0 && this._matrix.get([i, ((j - 1) | 0)]) === SIL.Machine.Translation.AlignmentType.Aligned) {
                return true;
            }
            if (i < ((this.getRowCount() - 1) | 0) && this._matrix.get([((i + 1) | 0), j]) === SIL.Machine.Translation.AlignmentType.Aligned) {
                return true;
            }
            if (j < ((this.getColumnCount() - 1) | 0) && this._matrix.get([i, ((j + 1) | 0)]) === SIL.Machine.Translation.AlignmentType.Aligned) {
                return true;
            }
            return false;
        },
        unionWith: function (other) {
            if (this.getRowCount() !== other.getRowCount() || this.getColumnCount() !== other.getColumnCount()) {
                throw new System.ArgumentException("The matrices are not the same size.", "other");
            }

            for (var i = 0; i < this.getRowCount(); i = (i + 1) | 0) {
                for (var j = 0; j < this.getColumnCount(); j = (j + 1) | 0) {
                    if (!(this._matrix.get([i, j]) === SIL.Machine.Translation.AlignmentType.Aligned || other._matrix.get([i, j]) === SIL.Machine.Translation.AlignmentType.Aligned)) {
                        this._matrix.set([i, j], SIL.Machine.Translation.AlignmentType.Aligned);
                    }
                }
            }
        },
        intersectWith: function (other) {
            if (this.getRowCount() !== other.getRowCount() || this.getColumnCount() !== other.getColumnCount()) {
                throw new System.ArgumentException("The matrices are not the same size.", "other");
            }

            for (var i = 0; i < this.getRowCount(); i = (i + 1) | 0) {
                for (var j = 0; j < this.getColumnCount(); j = (j + 1) | 0) {
                    if (!(this._matrix.get([i, j]) === SIL.Machine.Translation.AlignmentType.Aligned && other._matrix.get([i, j]) === SIL.Machine.Translation.AlignmentType.Aligned)) {
                        this._matrix.set([i, j], SIL.Machine.Translation.AlignmentType.NotAligned);
                    }
                }
            }
        },
        symmetrizeWith: function (other) {
            if (this.getRowCount() !== other.getRowCount() || this.getColumnCount() !== other.getColumnCount()) {
                throw new System.ArgumentException("The matrices are not the same size.", "other");
            }

            var aux = this.clone();

            this.intersectWith(other);
            var prev = null;
            while (!this.valueEquals(prev)) {
                prev = this.clone();
                for (var i = 0; i < this.getRowCount(); i = (i + 1) | 0) {
                    for (var j = 0; j < this.getColumnCount(); j = (j + 1) | 0) {
                        if ((other._matrix.get([i, j]) === SIL.Machine.Translation.AlignmentType.Aligned || aux._matrix.get([i, j]) === SIL.Machine.Translation.AlignmentType.Aligned) && this._matrix.get([i, j]) === SIL.Machine.Translation.AlignmentType.NotAligned) {
                            if (this.isColumnAligned(j) === SIL.Machine.Translation.AlignmentType.NotAligned && this.isRowAligned(i) === SIL.Machine.Translation.AlignmentType.NotAligned) {
                                this._matrix.set([i, j], SIL.Machine.Translation.AlignmentType.Aligned);
                            } else {
                                if (this.isNeighborAligned(i, j)) {
                                    this._matrix.set([i, j], SIL.Machine.Translation.AlignmentType.Aligned);
                                }
                            }
                        }
                    }
                }
            }
        },
        transpose: function () {
            var newMatrix = System.Array.create(0, null, SIL.Machine.Translation.AlignmentType, this.getColumnCount(), this.getRowCount());
            for (var i = 0; i < this.getRowCount(); i = (i + 1) | 0) {
                for (var j = 0; j < this.getColumnCount(); j = (j + 1) | 0) {
                    newMatrix.set([j, i], this._matrix.get([i, j]));
                }
            }
            this._matrix = newMatrix;
        },
        toGizaFormat: function (sourceSegment, targetSegment) {
            var $t;
            var sb = new System.Text.StringBuilder();
            sb.appendFormat("{0}\n", Bridge.toArray(targetSegment).join(" "));

            var sourceWords = $asm.$.SIL.Machine.Translation.WordAlignmentMatrix.f1(new (System.Collections.Generic.List$1(String))());
            sourceWords.addRange(sourceSegment);

            var i = 0;
            $t = Bridge.getEnumerator(sourceWords);
            while ($t.moveNext()) {
                var sourceWord = $t.getCurrent();
                if (i > 0) {
                    sb.append(" ");
                }
                sb.append(sourceWord);
                sb.append(" ({ ");
                for (var j = 0; j < this.getColumnCount(); j = (j + 1) | 0) {
                    if (i === 0) {
                        if (this.isColumnAligned(j) === SIL.Machine.Translation.AlignmentType.NotAligned) {
                            sb.append(((j + 1) | 0));
                            sb.append(" ");
                        }
                    } else if (this._matrix.get([((i - 1) | 0), j]) === SIL.Machine.Translation.AlignmentType.Aligned) {
                        sb.append(((j + 1) | 0));
                        sb.append(" ");
                    }
                }

                sb.append("})");
                i = (i + 1) | 0;
            }
            sb.append("\n");
            return sb.toString();
        },
        valueEquals: function (other) {
            if (other == null) {
                return false;
            }

            if (this.getRowCount() !== other.getRowCount() || this.getColumnCount() !== other.getColumnCount()) {
                return false;
            }

            for (var i = 0; i < this.getRowCount(); i = (i + 1) | 0) {
                for (var j = 0; j < this.getColumnCount(); j = (j + 1) | 0) {
                    if (this._matrix.get([i, j]) !== other._matrix.get([i, j])) {
                        return false;
                    }
                }
            }
            return true;
        },
        toString: function () {
            var sb = new System.Text.StringBuilder();
            for (var i = (this.getRowCount() - 1) | 0; i >= 0; i = (i - 1) | 0) {
                for (var j = 0; j < this.getColumnCount(); j = (j + 1) | 0) {
                    if (this._matrix.get([i, j]) === SIL.Machine.Translation.AlignmentType.Unknown) {
                        sb.append("U");
                    } else {
                        sb.append(this._matrix.get([i, j]));
                    }
                    sb.append(" ");
                }
                sb.appendLine();
            }
            return sb.toString();
        },
        clone: function () {
            return new SIL.Machine.Translation.WordAlignmentMatrix.ctor(this);
        }
    });

    Bridge.ns("SIL.Machine.Translation.WordAlignmentMatrix", $asm.$);

    Bridge.apply($asm.$.SIL.Machine.Translation.WordAlignmentMatrix, {
        f1: function (_o1) {
            _o1.add("NULL");
            return _o1;
        }
    });

    Bridge.define("SIL.Machine.Translation.WordGraph", {
        statics: {
            InitialState: 0,
            SmallScore: -999999999
        },
        _finalStates: null,
        config: {
            properties: {
                InitialStateScore: 0,
                Arcs: null,
                StateCount: 0
            }
        },
        ctor: function (arcs, finalStates, initialStateScore) {
            if (initialStateScore === void 0) { initialStateScore = 0.0; }

            this.$initialize();            var $t;

            this.setArcs(System.Linq.Enumerable.from(arcs).toArray());
            var maxState = -1;
            $t = Bridge.getEnumerator(this.getArcs(), SIL.Machine.Translation.WordGraphArc);
            while ($t.moveNext()) {
                var arc = $t.getCurrent();
                if (arc.getNextState() > maxState) {
                    maxState = arc.getNextState();
                }
                if (arc.getPrevState() > maxState) {
                    maxState = arc.getPrevState();
                }
            }
            this.setStateCount((maxState + 1) | 0);
            this._finalStates = new (System.Collections.Generic.HashSet$1(System.Int32)).$ctor1(finalStates);
            this.setInitialStateScore(initialStateScore);
    },
    getFinalStates: function () {
        return this._finalStates;
    },
    getIsEmpty: function () {
        return System.Array.getCount(this.getArcs(), SIL.Machine.Translation.WordGraphArc) === 0;
    },
    computeRestScores: function () {
        var $t;
        var restScores = System.Linq.Enumerable.repeat(SIL.Machine.Translation.WordGraph.SmallScore, this.getStateCount()).toArray();

        $t = Bridge.getEnumerator(this._finalStates);
        while ($t.moveNext()) {
            var state = $t.getCurrent();
            restScores[state] = this.getInitialStateScore();
        }

        for (var i = (System.Array.getCount(this.getArcs(), SIL.Machine.Translation.WordGraphArc) - 1) | 0; i >= 0; i = (i - 1) | 0) {
            var arc = System.Array.getItem(this.getArcs(), i, SIL.Machine.Translation.WordGraphArc);

            var score = arc.getScore() + restScores[arc.getNextState()];
            if (score < SIL.Machine.Translation.WordGraph.SmallScore) {
                score = SIL.Machine.Translation.WordGraph.SmallScore;
            }
            if (score > restScores[arc.getPrevState()]) {
                restScores[arc.getPrevState()] = score;
            }
        }

        return restScores;
    },
    computePrevScores: function (state, prevScores, stateBestPrevArcs) {
        if (this.getIsEmpty()) {
            prevScores.v = System.Array.init(0, 0, System.Double);
            stateBestPrevArcs.v = System.Array.init(0, 0, System.Int32);
            return;
        }

        prevScores.v = System.Linq.Enumerable.repeat(SIL.Machine.Translation.WordGraph.SmallScore, this.getStateCount()).toArray();
        stateBestPrevArcs.v = System.Array.init(this.getStateCount(), 0, System.Int32);

        if (state === SIL.Machine.Translation.WordGraph.InitialState) {
            prevScores.v[SIL.Machine.Translation.WordGraph.InitialState] = this.getInitialStateScore();
        } else {
            prevScores.v[state] = 0;
        }

        var accessibleStates = function (_o2) {
                _o2.add(state);
                return _o2;
            }(new (System.Collections.Generic.HashSet$1(System.Int32)).ctor());
        for (var arcIndex = 0; arcIndex < System.Array.getCount(this.getArcs(), SIL.Machine.Translation.WordGraphArc); arcIndex = (arcIndex + 1) | 0) {
            var arc = System.Array.getItem(this.getArcs(), arcIndex, SIL.Machine.Translation.WordGraphArc);

            if (accessibleStates.contains(arc.getPrevState())) {
                var score = arc.getScore() + prevScores.v[arc.getPrevState()];
                if (score < SIL.Machine.Translation.WordGraph.SmallScore) {
                    score = SIL.Machine.Translation.WordGraph.SmallScore;
                }
                if (score > prevScores.v[arc.getNextState()]) {
                    prevScores.v[arc.getNextState()] = score;
                    stateBestPrevArcs.v[arc.getNextState()] = arcIndex;
                }
                accessibleStates.add(arc.getNextState());
            } else {
                if (!accessibleStates.contains(arc.getNextState())) {
                    prevScores.v[arc.getNextState()] = SIL.Machine.Translation.WordGraph.SmallScore;
                }
            }
        }
    },
    getBestPathFromFinalStateToState: function (state) {
        var $t;
        var $yield = [];
        var prevScores = { };
        var stateBestPredArcs = { };
        this.computePrevScores(state, prevScores, stateBestPredArcs);

        var bestFinalStateScore = SIL.Machine.Translation.WordGraph.SmallScore;
        var bestFinalState = 0;
        $t = Bridge.getEnumerator(this._finalStates);
        while ($t.moveNext()) {
            var finalState = $t.getCurrent();
            var score = prevScores.v[finalState];
            if (bestFinalStateScore < score) {
                bestFinalState = finalState;
                bestFinalStateScore = score;
            }
        }

        if (!this._finalStates.contains(bestFinalState)) {
            return System.Array.toEnumerable($yield);
        }

        var curState = bestFinalState;
        var end = false;
        while (!end) {
            if (curState === state) {
                end = true;
            } else {
                var arcIndex = stateBestPredArcs.v[curState];
                var arc = System.Array.getItem(this.getArcs(), arcIndex, SIL.Machine.Translation.WordGraphArc);
                $yield.push(arc);
                curState = arc.getPrevState();
            }
        }
        return System.Array.toEnumerable($yield);
    }
    });

    Bridge.define("SIL.Machine.Translation.WordGraphArc", {
        config: {
            properties: {
                PrevState: 0,
                NextState: 0,
                Score: 0,
                Words: null,
                Alignment: null,
                WordConfidences: null,
                SourceStartIndex: 0,
                SourceEndIndex: 0,
                IsUnknown: false
            }
        },
        ctor: function (prevState, nextState, score, words, alignment, wordConfidences, sourceStartIndex, sourceEndIndex, isUnknown) {
            this.$initialize();
            this.setPrevState(prevState);
            this.setNextState(nextState);
            this.setScore(score);
            this.setWords(System.Linq.Enumerable.from(words).toArray());
            this.setAlignment(alignment);
            this.setWordConfidences(System.Linq.Enumerable.from(wordConfidences).toArray());
            this.setSourceStartIndex(sourceStartIndex);
            this.setSourceEndIndex(sourceEndIndex);
            this.setIsUnknown(isUnknown);
        }
    });

    Bridge.define("SIL.Machine.Web.IWebClient", {
        $kind: "interface"
    });

    Bridge.define("SIL.Machine.Annotations.IntegerSpanFactory", {
        inherits: [SIL.Machine.Annotations.SpanFactory$1(System.Int32)],
        config: {
            init: function () {
                this._empty = new (SIL.Machine.Annotations.Span$1(System.Int32))();
            }
        },
        ctor: function () {
            this.$initialize();
            SIL.Machine.Annotations.SpanFactory$1(System.Int32).ctor.call(this);
            this._empty = new (SIL.Machine.Annotations.Span$1(System.Int32)).$ctor2(this, -1, -1);
        },
        getEmpty: function () {
            return this._empty;
        },
        calcLength: function (start, end) {
            return ((end - start) | 0);
        },
        isRange: function (start, end) {
            return start !== end;
        },
        create$3: function (offset, dir) {
            return this.create$2(offset, ((offset + (dir === SIL.Machine.DataStructures.Direction.LeftToRight ? 1 : -1)) | 0), dir);
        }
    });

    Bridge.define("SIL.Machine.Tokenization.WhitespaceTokenizer", {
        inherits: [SIL.Machine.Tokenization.ITokenizer$2(String,System.Int32)],
        config: {
            properties: {
                SpanFactory: null
            },
            alias: [
            "tokenize", "SIL$Machine$Tokenization$ITokenizer$2$String$System$Int32$tokenize"
            ]
        },
        ctor: function () {
            SIL.Machine.Tokenization.WhitespaceTokenizer.$ctor1.call(this, new SIL.Machine.Annotations.IntegerSpanFactory());
        },
        $ctor1: function (spanFactory) {
            this.$initialize();
            this.setSpanFactory(spanFactory);
        },
        tokenize: function (data) {
            var $yield = [];
            var startIndex = -1;
            for (var i = 0; i < data.length; i = (i + 1) | 0) {
                if (System.Char.isWhiteSpace(String.fromCharCode(data.charCodeAt(i)))) {
                    if (startIndex !== -1) {
                        $yield.push(this.getSpanFactory().create$1(startIndex, i));
                    }
                    startIndex = -1;
                } else if (startIndex === -1) {
                    startIndex = i;
                }
            }

            if (startIndex !== -1) {
                $yield.push(this.getSpanFactory().create$1(startIndex, data.length));
            }
            return System.Array.toEnumerable($yield);
        }
    });

    Bridge.define("SIL.Machine.Tokenization.RegexTokenizer", {
        inherits: [SIL.Machine.Tokenization.ITokenizer$2(String,System.Int32)],
        _spanFactory: null,
        _regex: null,
        config: {
            alias: [
            "tokenize", "SIL$Machine$Tokenization$ITokenizer$2$String$System$Int32$tokenize"
            ]
        },
        $ctor1: function (regexPattern) {
            SIL.Machine.Tokenization.RegexTokenizer.ctor.call(this, new SIL.Machine.Annotations.IntegerSpanFactory(), regexPattern);
        },
        ctor: function (spanFactory, regexPattern) {
            this.$initialize();
            this._spanFactory = spanFactory;
            this._regex = new System.Text.RegularExpressions.Regex.ctor(regexPattern);
        },
        tokenize: function (data) {
            return System.Linq.Enumerable.from(this._regex.matches(data)).select(function(x) { return Bridge.cast(x, System.Text.RegularExpressions.Match); }).select(Bridge.fn.bind(this, $asm.$.SIL.Machine.Tokenization.RegexTokenizer.f1));
        }
    });

    Bridge.ns("SIL.Machine.Tokenization.RegexTokenizer", $asm.$);

    Bridge.apply($asm.$.SIL.Machine.Tokenization.RegexTokenizer, {
        f1: function (m) {
            return this._spanFactory.create$1(m.getIndex(), ((m.getIndex() + m.getLength()) | 0));
        }
    });

    Bridge.define("SIL.Machine.Tokenization.SimpleStringDetokenizer", {
        inherits: [SIL.Machine.Tokenization.IDetokenizer$2(String,String)],
        _operationSelector: null,
        config: {
            alias: [
            "detokenize", "SIL$Machine$Tokenization$IDetokenizer$2$String$String$detokenize"
            ]
        },
        ctor: function (operationSelector) {
            this.$initialize();
            this._operationSelector = operationSelector;
        },
        detokenize: function (tokens) {
            var $t;
            var currentRightLeftTokens = new (System.Collections.Generic.HashSet$1(String)).ctor();
            var sb = new System.Text.StringBuilder();
            var nextMergeLeft = true;
            $t = Bridge.getEnumerator(tokens, String);
            while ($t.moveNext()) {
                var token = $t.getCurrent();
                var mergeRight = false;
                switch (this._operationSelector(token)) {
                    case SIL.Machine.Tokenization.DetokenizeOperation.MergeLeft: 
                        nextMergeLeft = true;
                        break;
                    case SIL.Machine.Tokenization.DetokenizeOperation.MergeRight: 
                        mergeRight = true;
                        break;
                    case SIL.Machine.Tokenization.DetokenizeOperation.MergeRightFirstLeftSecond: 
                        if (currentRightLeftTokens.contains(token)) {
                            nextMergeLeft = true;
                            currentRightLeftTokens.remove(token);
                        } else {
                            mergeRight = true;
                            currentRightLeftTokens.add(token);
                        }
                        break;
                    case SIL.Machine.Tokenization.DetokenizeOperation.NoOperation: 
                        break;
                }

                if (!nextMergeLeft) {
                    sb.append(" ");
                } else {
                    nextMergeLeft = false;
                }

                sb.append(token);

                if (mergeRight) {
                    nextMergeLeft = true;
                }
            }
            return sb.toString();
        }
    });

    Bridge.define("SIL.Machine.Translation.SegmentEditDistance", {
        inherits: [SIL.Machine.Translation.EditDistance$2(System.Collections.Generic.IReadOnlyList$1(String),String)],
        statics: {
            getOpCounts: function (ops, hitCount, insCount, substCount, delCount) {
                var $t;
                hitCount.v = 0;
                insCount.v = 0;
                substCount.v = 0;
                delCount.v = 0;
                $t = Bridge.getEnumerator(ops, SIL.Machine.Translation.EditOperation);
                while ($t.moveNext()) {
                    var op = $t.getCurrent();
                    switch (op) {
                        case SIL.Machine.Translation.EditOperation.Hit: 
                            hitCount.v = (hitCount.v + 1) | 0;
                            break;
                        case SIL.Machine.Translation.EditOperation.Insert: 
                            insCount.v = (insCount.v + 1) | 0;
                            break;
                        case SIL.Machine.Translation.EditOperation.Substitute: 
                            substCount.v = (substCount.v + 1) | 0;
                            break;
                        case SIL.Machine.Translation.EditOperation.Delete: 
                            delCount.v = (delCount.v + 1) | 0;
                            break;
                    }
                }
            }
        },
        _wordEditDistance: null,
        ctor: function () {
            this.$initialize();
            SIL.Machine.Translation.EditDistance$2(System.Collections.Generic.IReadOnlyList$1(String),String).ctor.call(this);
            this._wordEditDistance = new SIL.Machine.Translation.WordEditDistance();
        },
        getHitCost: function () {
            return SIL.Machine.Translation.EditDistance$2(System.Collections.Generic.IReadOnlyList$1(String),String).prototype.getHitCost.call(this);
        },
        setHitCost: function (value) {
            SIL.Machine.Translation.EditDistance$2(System.Collections.Generic.IReadOnlyList$1(String),String).prototype.setHitCost.call(this, value);
            this._wordEditDistance.setHitCost(value);
        },
        getSubstitutionCost: function () {
            return SIL.Machine.Translation.EditDistance$2(System.Collections.Generic.IReadOnlyList$1(String),String).prototype.getSubstitutionCost.call(this);
        },
        setSubstitutionCost: function (value) {
            SIL.Machine.Translation.EditDistance$2(System.Collections.Generic.IReadOnlyList$1(String),String).prototype.setSubstitutionCost.call(this, value);
            this._wordEditDistance.setSubstitutionCost(value);
        },
        getInsertionCost: function () {
            return SIL.Machine.Translation.EditDistance$2(System.Collections.Generic.IReadOnlyList$1(String),String).prototype.getInsertionCost.call(this);
        },
        setInsertionCost: function (value) {
            SIL.Machine.Translation.EditDistance$2(System.Collections.Generic.IReadOnlyList$1(String),String).prototype.setInsertionCost.call(this, value);
            this._wordEditDistance.setInsertionCost(value);
        },
        getDeletionCost: function () {
            return SIL.Machine.Translation.EditDistance$2(System.Collections.Generic.IReadOnlyList$1(String),String).prototype.getDeletionCost.call(this);
        },
        setDeletionCost: function (value) {
            SIL.Machine.Translation.EditDistance$2(System.Collections.Generic.IReadOnlyList$1(String),String).prototype.setDeletionCost.call(this, value);
            this._wordEditDistance.setDeletionCost(value);
        },
        computePrefix$1: function (x, y, isLastItemComplete, usePrefixDelOp, wordOps, charOps) {
            var distMatrix = { };
            var dist = this.compute$2(x, y, isLastItemComplete, usePrefixDelOp, distMatrix);

            charOps.v = null;
            var i = { v : System.Array.getCount(x, String) };
            var j = { v : System.Array.getCount(y, String) };
            var ops = new (System.Collections.Generic.Stack$1(SIL.Machine.Translation.EditOperation)).ctor();
            while (i.v > 0 || j.v > 0) {
                var op = { v : new SIL.Machine.Translation.EditOperation() };
                this.processMatrixCell(x, y, distMatrix.v, usePrefixDelOp, j.v !== System.Array.getCount(y, String) || isLastItemComplete, i.v, j.v, i, j, op);
                if (op.v !== SIL.Machine.Translation.EditOperation.PrefixDelete) {
                    ops.push(op.v);
                }

                if (((j.v + 1) | 0) === System.Array.getCount(y, String) && !isLastItemComplete && op.v === SIL.Machine.Translation.EditOperation.Hit) {
                    this._wordEditDistance.computePrefix(System.Array.getItem(x, i.v, String), System.Array.getItem(y, ((System.Array.getCount(y, String) - 1) | 0), String), true, true, charOps);
                }
            }

            wordOps.v = ops.toArray();
            if (charOps.v == null) {
                charOps.v = System.Array.init(0, 0, SIL.Machine.Translation.EditOperation);
            }

            return dist;
        },
        incrComputePrefixFirstRow: function (scores, prevScores, yIncr) {
            var $t;
            if (!Bridge.referenceEquals(scores, prevScores)) {
                System.Array.clear(scores, System.Double);
                $t = Bridge.getEnumerator(prevScores, System.Double);
                while ($t.moveNext()) {
                    var score = $t.getCurrent();
                    System.Array.add(scores, score, System.Double);
                }
            }

            var startPos = System.Array.getCount(scores, System.Double);
            for (var jIncr = 0; jIncr < System.Array.getCount(yIncr, String); jIncr = (jIncr + 1) | 0) {
                var j = (startPos + jIncr) | 0;
                if (j === 0) {
                    System.Array.add(scores, this.getInsertionCost$1(System.Array.getItem(yIncr, jIncr, String)), System.Double);
                } else {
                    System.Array.add(scores, System.Array.getItem(scores, ((j - 1) | 0), System.Double) + this.getInsertionCost$1(System.Array.getItem(yIncr, jIncr, String)), System.Double);
                }
            }
        },
        incrComputePrefix: function (scores, prevScores, xWord, yIncr, isLastItemComplete) {
            var x = System.Array.init([xWord], String);
            var y = System.Array.init(((System.Array.getCount(prevScores, System.Double) - 1) | 0), null, String);
            for (var i = 0; i < System.Array.getCount(yIncr, String); i = (i + 1) | 0) {
                y[((((((System.Array.getCount(prevScores, System.Double) - System.Array.getCount(yIncr, String)) | 0) - 1) | 0) + i) | 0)] = System.Array.getItem(yIncr, i, String);
            }

            var distMatrix = this.initDistMatrix(x, y);

            for (var j = 0; j < System.Array.getCount(prevScores, System.Double); j = (j + 1) | 0) {
                distMatrix.set([0, j], System.Array.getItem(prevScores, j, System.Double));
            }
            for (var j1 = 0; j1 < System.Array.getCount(scores, System.Double); j1 = (j1 + 1) | 0) {
                distMatrix.set([1, j1], System.Array.getItem(scores, j1, System.Double));
            }

            while (System.Array.getCount(scores, System.Double) < System.Array.getCount(prevScores, System.Double)) {
                System.Array.add(scores, 0, System.Double);
            }

            var startPos = (System.Array.getCount(prevScores, System.Double) - System.Array.getCount(yIncr, String)) | 0;

            var ops = new (System.Collections.Generic.List$1(SIL.Machine.Translation.EditOperation))();
            for (var jIncr = 0; jIncr < System.Array.getCount(yIncr, String); jIncr = (jIncr + 1) | 0) {
                var j2 = (startPos + jIncr) | 0;
                var iPred = { }, jPred = { };
                var op = { v : new SIL.Machine.Translation.EditOperation() };
                var dist = this.processMatrixCell(x, y, distMatrix, false, j2 !== y.length || isLastItemComplete, 1, j2, iPred, jPred, op);
                System.Array.setItem(scores, j2, dist, System.Double);
                distMatrix.set([1, j2], dist);
                ops.add(op.v);
            }

            return ops;
        },
        getCount: function (item) {
            return System.Array.getCount(item, String);
        },
        getItem: function (seq, index) {
            return System.Array.getItem(seq, index, String);
        },
        getHitCost$1: function (x, y, isComplete) {
            return this.getHitCost() * y.length;
        },
        getSubstitutionCost$1: function (x, y, isComplete) {
            if (Bridge.referenceEquals(x, "")) {
                return (this.getSubstitutionCost() * 0.99) * y.length;
            }

            var ops = { };
            if (isComplete) {
                this._wordEditDistance.compute$1(x, y, ops);
            } else {
                this._wordEditDistance.computePrefix(x, y, true, true, ops);
            }

            var hitCount = { }, insCount = { }, substCount = { }, delCount = { };
            SIL.Machine.Translation.SegmentEditDistance.getOpCounts(ops.v, hitCount, insCount, substCount, delCount);

            return (this.getHitCost() * hitCount.v) + (this.getInsertionCost() * insCount.v) + (this.getSubstitutionCost() * substCount.v) + (this.getDeletionCost() * delCount.v);
        },
        getDeletionCost$1: function (x) {
            if (Bridge.referenceEquals(x, "")) {
                return this.getDeletionCost();
            }
            return this.getDeletionCost() * x.length;
        },
        getInsertionCost$1: function (y) {
            return this.getInsertionCost() * y.length;
        },
        isHit: function (x, y, isComplete) {
            return Bridge.referenceEquals(x, y) || (!isComplete && System.String.startsWith(x, y));
        }
    });

    Bridge.define("SIL.Machine.Translation.WordEditDistance", {
        inherits: [SIL.Machine.Translation.EditDistance$2(String,System.Char)],
        getCount: function (item) {
            return item.length;
        },
        getItem: function (seq, index) {
            return seq.charCodeAt(index);
        },
        getHitCost$1: function (x, y, isComplete) {
            return this.getHitCost();
        },
        getSubstitutionCost$1: function (x, y, isComplete) {
            return this.getSubstitutionCost();
        },
        getDeletionCost$1: function (x) {
            return this.getDeletionCost();
        },
        getInsertionCost$1: function (y) {
            return this.getInsertionCost();
        },
        isHit: function (x, y, isComplete) {
            return x === y;
        }
    });

    Bridge.define("SIL.Machine.Web.AjaxWebClient", {
        inherits: [SIL.Machine.Web.IWebClient],
        config: {
            alias: [
            "send", "SIL$Machine$Web$IWebClient$send"
            ]
        },
        send: function (method, url, body, contentType, onSuccess, onError) {
            if (body === void 0) { body = null; }
            if (contentType === void 0) { contentType = null; }
            if (onSuccess === void 0) { onSuccess = null; }
            if (onError === void 0) { onError = null; }
            var request = new XMLHttpRequest();
            if (!Bridge.staticEquals(onSuccess, null) || !Bridge.staticEquals(onError, null)) {
                request.onreadystatechange = function () {
                    if (request.readyState !== 4) {
                        return;
                    }

                    if (request.status === 200 || request.status === 304) {
                        !Bridge.staticEquals(onSuccess, null) ? onSuccess(request.responseText) : null;
                    } else {
                        !Bridge.staticEquals(onError, null) ? onError(request.status) : null;
                    }
                };
            }

            request.open(method, url);
            if (contentType != null) {
                request.setRequestHeader("Content-Type", contentType);
            }
            if (body == null) {
                request.send();
            } else {
                request.send(body);
            }
        }
    });

    Bridge.define("SIL.Machine.Tokenization.LatinWordTokenizer", {
        inherits: [SIL.Machine.Tokenization.WhitespaceTokenizer],
        _innerWordPunctRegex: null,
        _abbreviations: null,
        config: {
            alias: [
            "tokenize", "SIL$Machine$Tokenization$ITokenizer$2$String$System$Int32$tokenize"
            ],
            init: function () {
                this._innerWordPunctRegex = new System.Text.RegularExpressions.Regex.ctor("\\G[&'\\-.:=?@­·‐‑’‧]|_+");
            }
        },
        ctor: function () {
            SIL.Machine.Tokenization.LatinWordTokenizer.$ctor1.call(this, new SIL.Machine.Annotations.IntegerSpanFactory());
        },
        $ctor3: function (abbreviations) {
            SIL.Machine.Tokenization.LatinWordTokenizer.$ctor2.call(this, new SIL.Machine.Annotations.IntegerSpanFactory(), abbreviations);
        },
        $ctor1: function (spanFactory) {
            SIL.Machine.Tokenization.LatinWordTokenizer.$ctor2.call(this, spanFactory, System.Linq.Enumerable.empty());
        },
        $ctor2: function (spanFactory, abbreviations) {
            this.$initialize();
            SIL.Machine.Tokenization.WhitespaceTokenizer.$ctor1.call(this, spanFactory);
            this._abbreviations = new (System.Collections.Generic.HashSet$1(String)).$ctor1(System.Linq.Enumerable.from(abbreviations).select(Bridge.fn.cacheBind(this, this.toLower)));
        },
        tokenize: function (data) {
            var $t;
            var $yield = [];
            $t = Bridge.getEnumerator(SIL.Machine.Tokenization.WhitespaceTokenizer.prototype.tokenize.call(this, data), SIL.Machine.Annotations.Span$1(System.Int32));
            while ($t.moveNext()) {
                var span = $t.getCurrent();
                var wordStart = -1;
                var innerWordPunct = -1;
                var i = span.getStart();
                while (i < span.getEnd()) {
                    if (System.Char.isPunctuation(data.charCodeAt(i)) || System.Char.isSymbol(data.charCodeAt(i)) || System.Char.isControl(data.charCodeAt(i))) {
                        if (wordStart === -1) {
                            $yield.push(this.getSpanFactory().create(i));
                        } else if (innerWordPunct !== -1) {
                            $yield.push(this.getSpanFactory().create$1(wordStart, innerWordPunct));
                            $yield.push(this.getSpanFactory().create$1(innerWordPunct, i));
                        } else {
                            var match = this._innerWordPunctRegex.match$1(data, i);
                            if (match.getSuccess()) {
                                innerWordPunct = i;
                                i = (i + match.getLength()) | 0;
                                continue;
                            }

                            $yield.push(this.getSpanFactory().create$1(wordStart, i));
                            $yield.push(this.getSpanFactory().create(i));
                        }
                        wordStart = -1;
                    } else if (wordStart === -1) {
                        wordStart = i;
                    }

                    innerWordPunct = -1;
                    i = (i + 1) | 0;
                }

                if (wordStart !== -1) {
                    if (innerWordPunct !== -1) {
                        if (Bridge.referenceEquals(data.substr(innerWordPunct, ((span.getEnd() - innerWordPunct) | 0)), ".") && this._abbreviations.contains(this.toLower(data.substr(wordStart, ((innerWordPunct - wordStart) | 0))))) {
                            $yield.push(this.getSpanFactory().create$1(wordStart, span.getEnd()));
                        } else {
                            $yield.push(this.getSpanFactory().create$1(wordStart, innerWordPunct));
                            $yield.push(this.getSpanFactory().create$1(innerWordPunct, span.getEnd()));
                        }
                    } else {
                        $yield.push(this.getSpanFactory().create$1(wordStart, span.getEnd()));
                    }
                }
            }
            return System.Array.toEnumerable($yield);
        },
        toLower: function (str) {
            return str.toLowerCase();
        }
    });
});
