/*!
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { Box, HStack, Table, Text, type SelectValueChangeDetails } from "@chakra-ui/react";
import { useState, useCallback } from "react";
import { useUiServiceJobs } from "openapi/queries";
import { Link } from "react-router-dom";
import TimeAgo from "react-timeago";

import { ErrorAlert } from "src/components/ErrorAlert";
import { SearchBar } from "src/components/SearchBar";
import { StateBadge } from "src/components/StateBadge";
import { Select } from "src/components/ui";
import { jobStateOptions } from "src/constants";
import { autoRefreshInterval } from "src/utils";
import type { TaskInstanceState } from "openapi/requests/types.gen";

export const JobsPage = () => {
  const [dagIdPattern, setDagIdPattern] = useState("");
  const [taskIdPattern, setTaskIdPattern] = useState("");
  const [queuePattern, setQueuePattern] = useState("");
  const [workerNamePattern, setWorkerNamePattern] = useState("");
  const [filteredState, setFilteredState] = useState<string[]>([]);

  const hasFilteredState = filteredState.length > 0;

  const { data, error } = useUiServiceJobs(
    {
      dagIdPattern: dagIdPattern || undefined,
      taskIdPattern: taskIdPattern || undefined,
      queuePattern: queuePattern || undefined,
      workerNamePattern: workerNamePattern || undefined,
      state: hasFilteredState ? (filteredState as TaskInstanceState[]) : undefined,
    },
    undefined,
    {
      enabled: true,
      refetchInterval: autoRefreshInterval,
    },
  );

  const handleDagIdSearchChange = (value: string) => {
    setDagIdPattern(value);
  };

  const handleTaskIdSearchChange = (value: string) => {
    setTaskIdPattern(value);
  };

  const handleQueueSearchChange = (value: string) => {
    setQueuePattern(value);
  };

  const handleWorkerSearchChange = (value: string) => {
    setWorkerNamePattern(value);
  };

  const handleStateChange = useCallback(({ value }: SelectValueChangeDetails<string>) => {
    const [val, ...rest] = value;

    if ((val === undefined || val === "all") && rest.length === 0) {
      setFilteredState([]);
    } else {
      setFilteredState(value.filter((state) => state !== "all"));
    }
  }, []);

  // TODO to make it proper
  // Use DataTable as component from Airflow-Core UI
  // Add sorting
  // Translation?
  return (
    <Box p={2}>
      <HStack gap={4} mb={4}>
        <SearchBar
          buttonProps={{ disabled: true }}
          defaultValue={dagIdPattern}
          hideAdvanced
          hotkeyDisabled
          onChange={handleDagIdSearchChange}
          placeHolder="Search DAG ID"
        />
        <SearchBar
          buttonProps={{ disabled: true }}
          defaultValue={taskIdPattern}
          hideAdvanced
          hotkeyDisabled
          onChange={handleTaskIdSearchChange}
          placeHolder="Search Task ID"
        />
        <SearchBar
          buttonProps={{ disabled: true }}
          defaultValue={queuePattern}
          hideAdvanced
          hotkeyDisabled
          onChange={handleQueueSearchChange}
          placeHolder="Search Queue"
        />
        <SearchBar
          buttonProps={{ disabled: true }}
          defaultValue={workerNamePattern}
          hideAdvanced
          hotkeyDisabled
          onChange={handleWorkerSearchChange}
          placeHolder="Search Worker"
        />
        <Select.Root
          collection={jobStateOptions}
          maxW="450px"
          multiple
          onValueChange={handleStateChange}
          value={hasFilteredState ? filteredState : ["all"]}
        >
          <Select.Trigger
            {...(hasFilteredState ? { clearable: true } : {})}
            colorPalette="brand"
            isActive={Boolean(filteredState)}
          >
            <Select.ValueText>
              {() =>
                hasFilteredState ? (
                  <HStack flexWrap="wrap" fontSize="sm" gap="4px" paddingY="8px">
                    {filteredState.map((state) => (
                      <StateBadge key={state} state={state as TaskInstanceState}>
                        {state}
                      </StateBadge>
                    ))}
                  </HStack>
                ) : (
                  "All States"
                )
              }
            </Select.ValueText>
          </Select.Trigger>
          <Select.Content>
            {jobStateOptions.items.map((option) => (
              <Select.Item item={option} key={option.label}>
                {option.value === "all" ? (
                  option.label
                ) : (
                  <StateBadge state={option.value as TaskInstanceState}>{option.label}</StateBadge>
                )}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </HStack>
      {error ? (
        <ErrorAlert error={error} />
      ) : data?.jobs && data.jobs.length > 0 ? (
        <Table.Root size="sm" interactive stickyHeader striped>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Dag ID</Table.ColumnHeader>
              <Table.ColumnHeader>Run ID</Table.ColumnHeader>
              <Table.ColumnHeader>Task ID</Table.ColumnHeader>
              <Table.ColumnHeader>Map Index</Table.ColumnHeader>
              <Table.ColumnHeader>Try Number</Table.ColumnHeader>
              <Table.ColumnHeader>State</Table.ColumnHeader>
              <Table.ColumnHeader>Queue</Table.ColumnHeader>
              <Table.ColumnHeader>Queued DTTM</Table.ColumnHeader>
              <Table.ColumnHeader>Edge Worker</Table.ColumnHeader>
              <Table.ColumnHeader>Last Update</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {data.jobs.map((job) => (
              <Table.Row
                key={`${job.dag_id}.${job.run_id}.${job.task_id}.${job.map_index}.${job.try_number}`}
              >
                <Table.Cell>
                  <Link to={`/dags/${job.dag_id}`}>{job.dag_id}</Link>
                </Table.Cell>
                <Table.Cell>
                  <Link to={`/dags/${job.dag_id}/runs/${job.run_id}`}>{job.run_id}</Link>
                </Table.Cell>
                <Table.Cell>
                  {job.map_index >= 0 ? (
                    <Link
                      to={`/dags/${job.dag_id}/runs/${job.run_id}/tasks/${job.task_id}/mapped/${job.map_index}?try_number=${job.try_number}`}
                    >
                      {job.task_id}
                    </Link>
                  ) : (
                    <Link
                      to={`/dags/${job.dag_id}/runs/${job.run_id}/tasks/${job.task_id}?try_number=${job.try_number}`}
                    >
                      {job.task_id}
                    </Link>
                  )}
                </Table.Cell>
                <Table.Cell>{job.map_index >= 0 ? job.map_index : "-"}</Table.Cell>
                <Table.Cell>{job.try_number}</Table.Cell>
                <Table.Cell>
                  <StateBadge state={job.state}>{job.state}</StateBadge>
                </Table.Cell>
                <Table.Cell>{job.queue}</Table.Cell>
                <Table.Cell>
                  {job.queued_dttm ? <TimeAgo date={job.queued_dttm} live={false} /> : undefined}
                </Table.Cell>
                <Table.Cell>
                  <Link to={`../worker#${job.edge_worker}`}>{job.edge_worker}</Link>
                </Table.Cell>
                <Table.Cell>
                  {job.last_update ? <TimeAgo date={job.last_update} live={false} /> : undefined}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      ) : data ? (
        <Text>
          Currently no jobs running. Start a Dag and then all active jobs should show up here. Note that
          after some (configurable) time, jobs are purged from the list.
        </Text>
      ) : (
        <Text>Loading...</Text>
      )}
    </Box>
  );
};
